const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function normalizeTicketId(raw) {
  if (!raw) return '';
  return String(raw).trim().toUpperCase().replace(/[-\s]/g, '');
}

async function testCandidatesRoute() {
  try {
    const [
      { data: allotmentsData, error: allotErr },
      { data: docsData, error: docsErr },
      { data: regsData, error: regsErr },
      { data: propsData, error: propsErr },
    ] = await Promise.all([
      supabase.from('allotments').select('id, metadata'),
      supabase
        .from('documents')
        .select('id, document_type, form_data, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('registrations')
        .select(
          'id, submission_id, name, phone, email, project, property_size, plot_preference, scheme_amount, advisor_name, created_at'
        )
        .order('created_at', { ascending: false }),
      supabase.from('properties').select('id, name, slug'),
    ]);

    if (allotErr) console.error('allotErr:', allotErr);
    if (docsErr) console.error('docsErr:', docsErr);
    if (regsErr) console.error('regsErr:', regsErr);
    if (propsErr) console.error('propsErr:', propsErr);

    console.log('Allotments count:', allotmentsData?.length);
    console.log('Docs count:', docsData?.length);
    console.log('Regs count:', regsData?.length);
    console.log('Props count:', propsData?.length);

    const approvedNormalizedIds = new Set();
    (allotmentsData || []).forEach((a) => {
      const meta = a.metadata || {};
      const tId = meta.ticket_id || meta.ticketId;
      if (tId) {
        approvedNormalizedIds.add(normalizeTicketId(tId));
      }
    });

    const candidatesMap = new Map();

    (regsData || []).forEach((r) => {
      const rawId = r.submission_id;
      const normId = normalizeTicketId(rawId);
      if (!normId) return;
      candidatesMap.set(normId, {
        ticketId: rawId?.trim() || normId,
        normalizedId: normId,
        clientName: r.name || '',
        email: r.email || '',
        phone: r.phone || '',
        projectName: r.project || '',
        propertyId: null,
        unitNo: r.plot_preference || '',
        area: r.property_size || '',
        totalCost: Number(r.scheme_amount) || 0,
        bookingDate: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '',
        documentCount: 0,
        sources: ['Registration Form'],
        paymentMilestones: [],
        advisorName: r.advisor_name?.trim() || '',
      });
    });

    (docsData || []).forEach((d) => {
      const fd = d.form_data || {};
      const rawId = fd.ticketId || fd.refId || fd.ticket_id || fd.ref_id || fd.ticket;
      const normId = normalizeTicketId(rawId);
      if (!normId) return;

      const clientName = fd.clientName || fd.name || fd.client_name || '';
      const email = fd.clientEmail || fd.email || '';
      const phone = fd.clientPhone || fd.phone || '';
      const projectName = fd.projectName || fd.project || '';
      const unitNo = fd.unitNumber || fd.plotNumber || fd.unit_no || '';
      const area = fd.area || fd.plotSize || fd.plot_area || '';
      let calculatedCost = Number(fd.totalCost || fd.total_cost) || 0;
      if (!calculatedCost && fd.bsp && area) {
        const areaNum = parseFloat(String(area)) || 0;
        const bspNum = parseFloat(String(fd.bsp)) || 0;
        if (areaNum > 0 && bspNum > 0) {
          calculatedCost = Math.round(areaNum * bspNum);
        }
      }
      if (!calculatedCost && d.document_type !== 'payment_receipt') {
        calculatedCost = Number(fd.amount) || 0;
      }
      const bookingDate = fd.allotmentDate || fd.bookingDate || fd.date || '';
      const advisorName = (fd.advisorName ||
        fd.advisor_name ||
        fd.agentName ||
        fd.agent_name ||
        '');

      if (!candidatesMap.has(normId)) {
        candidatesMap.set(normId, {
          ticketId: String(rawId).trim(),
          normalizedId: normId,
          clientName,
          email,
          phone,
          projectName,
          propertyId: null,
          unitNo: String(unitNo),
          area,
          totalCost: calculatedCost,
          bookingDate: bookingDate
            ? new Date(bookingDate).toISOString().split('T')[0]
            : d.created_at
              ? new Date(d.created_at).toISOString().split('T')[0]
              : '',
          documentCount: 1,
          sources: [d.document_type || 'Document'],
          paymentMilestones: [],
          advisorName: advisorName ? advisorName.trim() : '',
        });
      } else {
        const item = candidatesMap.get(normId);
        item.documentCount += 1;
        if (!item.sources.includes(d.document_type || 'Document')) {
          item.sources.push(d.document_type || 'Document');
        }
      }

      if (d.document_type === 'payment_receipt') {
        const item = candidatesMap.get(normId);
        const receiptAmount = Number(fd.amount || fd.receivedAmount || fd.totalAmount) || 0;
        const receiptDate =
          fd.receiptDate ||
          fd.date ||
          (d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : '');
        const milestoneTitle =
          fd.installmentName || fd.purpose || `Payment Receipt #${d.id.slice(0, 6)}`;

        if (receiptAmount > 0) {
          item.paymentMilestones.push({
            title: milestoneTitle,
            amount: receiptAmount,
            dueDate: receiptDate || new Date().toISOString().split('T')[0],
            status: 'paid',
            paidDate: receiptDate || new Date().toISOString().split('T')[0],
          });
        }
      }
    });

    console.log('Total candidates processed:', candidatesMap.size);
    const allCandidates = Array.from(candidatesMap.values());
    const pending = allCandidates.filter(c => !approvedNormalizedIds.has(c.normalizedId));
    console.log('Pending candidates:', pending.length);
  } catch(e) {
    console.error('CRASHED WITH ERROR:', e);
  }
}
testCandidatesRoute();

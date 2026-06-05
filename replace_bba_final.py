import re

file_path = r'c:\Users\addy\Music\svi-new\app\admin\bba\BbaLegalPages.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# ========== PAGE 2 FIXES ==========

# Fix: Agreement sentence - 'Agreement' should be bold
old = """        <p className="mb-3 text-justify">
          This Agreement (the 'Agreement') is made at Noida on this{' '}
          {new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
          .
        </p>"""
new = """        <p className="mb-3 text-justify">
          This Agreement (the <strong>'Agreement'</strong>) is made at Noida on this{' '}
          <strong>{new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}</strong>
          .
        </p>"""
content = content.replace(old, new)

# Fix: SVI para - 'Firm' and 'FIRST PART' should be bold
old = """        <p className="mb-3 text-justify">
          M/s. SVI INFRA SOLUTIONS PVT LTD, firm presently having its Registered Office at A-61
          Sector-65 Noida Uttar Pradesh 201309 (hereinafter referred to as the 'Firm which
          expression shall, unless it be repugnant to the context or meaning thereof, be deemed to
          include its executors, successors) acting through its Authorized Signatory of the FIRST
          PART.
        </p>"""
new = """        <p className="mb-3 text-justify">
          <strong>M/s. SVI INFRA SOLUTIONS PVT LTD,</strong> firm presently having its Registered Office at{' '}
          <strong>A-61 Sector-65 Noida Uttar Pradesh 201309</strong>{' '}
          (hereinafter referred to as the <strong>'Firm'</strong> which expression shall, unless it be repugnant to
          the context or meaning thereof, be deemed to include its executors, successors) acting
          through its Authorized Signatory of the <strong>FIRST PART</strong>.
        </p>"""
content = content.replace(old, new)

# Fix: "(FOR INDIVIDUALS) 1st ALLOTTEE" should be on its own line, left-aligned (not justified like body)
old = '        <p className="mb-3 text-justify">(FOR INDIVIDUALS) 1st ALLOTTEE</p>'
new = '        <p className="mb-1 font-normal">(FOR INDIVIDUALS) 1st ALLOTTEE</p>'
content = content.replace(old, new)

# Fix: Mr/Ms/Mrs line - Name and address should be bold
old = """        <p className="mb-3 text-justify">
          Mr/Ms/Mrs : {formData.clientName} (Aadhar No : _________________) Son/Daughter/Wife of :
          _________________ H/No: {formData.address}
        </p>"""
new = """        <p className="mb-1 font-bold">
          Mr/Ms/Mrs : {formData.clientName} (Aadhar No : _________________)
        </p>
        <p className="mb-1">Son/Daughter/Wife of : _________________</p>
        <p className="mb-3 font-bold">H/No: {formData.address}</p>"""
content = content.replace(old, new)

# ========== PAGE 3 FIXES ==========

# Fix: 2nd ALLOTTEE - should be bold with proper line formatting matching PDF
old = """        <p className="mb-3 text-justify">
          2nd ALLOTTEE Mr/Ms/Mrs……………………………………………….……………………………………………………………………………………………
          Son/Daughter/Wife of ……………………………………………………………………………………………….………………………
          R/o…………………………………………………………………………………………………………………………………………...….
        </p>"""
new = """        <p className="mb-1 font-bold">2nd ALLOTTEE</p>
        <p className="mb-1">Mr/Ms/Mrs………………………………………………………………………………………………………………………………………………………………</p>
        <p className="mb-1">Son/Daughter/Wife of ………………………………………………………………………………………………………………………</p>
        <p className="mb-3">R/o………………………………………………………………………………………………………………………………………………………………</p>"""
content = content.replace(old, new)

# Fix: 3rd ALLOTTEE - The 'Son/Daughter/' and '3rd ALLOTTEE Mr/Ms/Mrs. Wife of R/o' should be properly formatted
old = '        <p className="mb-3 text-justify">Son/Daughter/</p>\n        <p className="mb-3 text-justify">3rd ALLOTTEE Mr/Ms/Mrs. Wife of R/o</p>'
new = """        <p className="mb-1 font-bold">3rd ALLOTTEE</p>
        <p className="mb-1">Mr/Ms/Mrs _____________________________________________________ Son/Daughter/</p>
        <p className="mb-1">Wife of _____________________________________________________</p>
        <p className="mb-3">R/o _____________________________________________________</p>"""
content = content.replace(old, new)

# Fix: OR (FOR FIRMS) - reformat to match PDF with underlines
old = """        <p className="mb-3 text-justify">
          (FOR FIRMS) M/s. proprietorship firm duly registered and having its office at
        </p>
        <p className="mb-3 text-justify">a partnership/</p>
        <p className="mb-3 text-justify">through its Authorized Signatory Partner/ Sole</p>
        <p className="mb-3 text-justify">Proprietor Mr. / Ms. / Mrs R/o</p>
        <p className="mb-3 text-justify">
          OR (FOR COMPANIES) M/s. registered under Companies Act, 1965 having its registered office
          at
        </p>
        <p className="mb-3 text-justify">a firm duly</p>
        <p className="mb-3 text-justify">Mrs dated</p>
        <p className="mb-3 text-justify">.</p>
        <p className="mb-3 text-justify"># (Strike out whatever is not applicable)</p>
        <p className="mb-3 text-justify">through its duly Authorized Signatory Mr. / Ms. /</p>
        <p className="mb-3 text-justify">authorized by board resolution</p>"""
new = """        <p className="mb-1">(FOR FIRMS) M/s. _____________________________________________________ a partnership/</p>
        <p className="mb-1">proprietorship firm duly registered and having its office at ____________________________</p>
        <p className="mb-1">through its Authorized Signatory Partner/ Sole</p>
        <p className="mb-3">Proprietor Mr. / Ms. / Mrs _____________________ R/o _____________________________</p>
        <p className="my-4 text-center font-bold text-lg">OR</p>
        <p className="mb-1">(FOR COMPANIES) M/s. _____________________________________________________ a firm duly</p>
        <p className="mb-1">registered under Companies Act, 1965 having its registered office at</p>
        <p className="mb-1">_____________________________________________________ through its duly Authorized Signatory Mr. / Ms. /</p>
        <p className="mb-1">Mrs _____________________ authorized by board resolution dated _____________.</p>
        <p className="mb-3"># (Strike out whatever is not applicable)</p>"""
content = content.replace(old, new)

# Fix: 'Allottee' and 'SECOND PART' in hereinafter para should be bold
old = """        <p className="mb-3 text-justify">
          Hereinafter jointly and severally referred to as the 'Allottee' (which expression unless
          excluded by or repugnant to the context or meaning thereof, shall mean and include
          his/her/its heirs, executors, administrators, successors and legal representatives) of the
          SECOND PART.
        </p>"""
new = """        <p className="mb-3 text-justify">
          Hereinafter jointly and severally referred to as the <strong>'Allottee'</strong> (which expression unless
          excluded by or repugnant to the context or meaning thereof, shall mean and include
          his/her/its heirs, executors, administrators, successors and legal representatives) of the
          <strong>SECOND PART</strong>.
        </p>"""
content = content.replace(old, new)

# Fix: 'Party' and 'Parties' should be bold
old = """        <p className="mb-3 text-justify">
          The firm and Allottee are hereinafter individually referred to as the 'Party' and
          collectively referred to as the 'Parties'.
        </p>"""
new = """        <p className="mb-3 text-justify">
          The <strong>firm</strong> and <strong>Allottee</strong> are hereinafter individually referred to as the <strong>'Party'</strong> and
          collectively referred to as the <strong>'Parties'</strong>.
        </p>"""
content = content.replace(old, new)

# Fix: WHEREAS bold prefix
old = """        <p className="mb-3 text-justify">
          <span className="font-bold">WHEREAS</span> the firm is bona fide purchaser of the land bearing "SHYAM AANGAN", Village Basadi
          Tehsil Kishan Garh Renwal, Dist. Jaipur, State – Rajasthan (hereinafter referred to as the
          'Said Land').
        </p>"""
new = """        <p className="mb-3 text-justify">
          <strong>WHEREAS</strong> the firm is bona fide purchaser of the land bearing "SHYAM AANGAN", Village Basadi
          Tehsil Kishan Garh Renwal, Dist. Jaipur, State – Rajasthan (hereinafter referred to as the
          '<strong>Said Land</strong>').
        </p>"""
content = content.replace(old, new)

# Fix all AND WHEREAS spans to use strong instead of span
content = content.replace('<span className="font-bold">AND WHEREAS</span>', '<strong>AND WHEREAS</strong>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('All replacements done successfully.')

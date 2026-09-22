# Implementation Plan - Notification Dropdown Luxury Redesign

**Objective**: Redesign and elevate `src/components/admin/NotificationDropdown.tsx` to an Executive Luxury standard matching SVI Obsidian & Warm Gold identity, resolving visual noise, raw UUIDs, native scrollbar clunkiness, and adding high-conversion quick actions for leads.

---

### Key Architectural & Design Decisions

1. **Tabs Structure (`Alerts`, `Leads`, `Tasks`, `Sounds`)**:
   - Add dedicated `Leads` tab for rapid sales triage (filtering chatbot leads & CRM inquiries).
   - Retain `Alerts`, `Tasks`, and `Sounds` for full backward compatibility and zero test regression.
   - Header also features a quick audio chime toggle (`Volume2 / VolumeX`).
2. **Visual Hierarchy & Noise Elimination**:
   - Replace repetitive `"• Unread"` labels with a glowing Warm Gold indicator (`#D4AF37`) at the card edge.
   - Replace raw UUID hashes in notifications (`changed registration 4cfe6cbf...`) with formatted entity tags (`#REG-4CFE`).
   - Cohesive SVI palette: Deep Obsidian surface (`#070b14` / `#0a1120`), 1px gold hairline borders (`border-brand-gold/15`), gold accents (`#D4AF37`).
3. **High-ROI Quick Actions**:
   - For chat/CRM leads with phone numbers, render inline micro-action buttons:
     - `📞 Call` (`href="tel:..."`)
     - `💬 WhatsApp` (`href="https://wa.me/..."`)
   - Both actions stop event propagation to prevent unintended dropdown closing or route navigation.
4. **Custom Dark Glass Scrollbar**:
   - Replace native white scrollbars with sleek translucent styling:
     `scrollbar-thin [scrollbar-color:rgba(212,175,55,0.25)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-brand-gold/30`.
5. **Deduplication & Polished Layout**:
   - Deduplicate adjacent/repeated lead notifications from the same sender within short time frames.
   - Sleek footer with "SVI Sound & Notification Center", "Test Tone", and "View all notifications →".

---

### Verification

- Vitest suite `__tests__/admin/notifications/NotificationDropdown.test.tsx` passes completely.
- `pnpm typecheck` passes with 0 errors.
- `pnpm lint` passes with 0 warnings.
- Keep changes unpushed until user approves.

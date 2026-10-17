# TAMANNA MOTORS Migration Roadmap

- [x] Remove unused old login/audit/deletion UI and unused themes; preserve records, sync and active module styling; route tests and excavator login/reload verified. Signed-in screen check unavailable because no session could be minted for the requester.

- [x] Redesign login with excavator and spare-parts imagery; verify desktop/mobile, signup/reset forms, password visibility and invalid-login feedback without changing authentication.

- [x] Redesign home dashboard with richer visual hierarchy; verify authenticated light/dark and mobile views without changing data.

- [x] Apply database schema via migration
- [x] Seed data bundled with app (importedTamannaData.json: products, sales, purchases, contacts)
- [x] Port React app into TanStack Start route (src/tamanna/, route /)
- [x] Replace old Supabase/Firebase clients with Lovable Cloud client (sync_documents table + realtime)
- [x] Remove Firebase/Express/Drizzle dependencies
- [x] Verify build + login + dashboard in preview
- [x] Sign in to hisabnikash, inventory modules (counts match existing app data)
- [x] All hisabnikash data loaded into cloud database (521 products, 83 contacts, 840 sales, 248 purchases, 6 expenses, 2 returns, 2 adjustments)
- [x] Email sign-up & login
- [x] Premium redesign
- [x] Missing sections: returns, stock adjustment, cash/ledger, profit & loss
- [x] hisabnikash look (purple bar, white sidebar)
- [x] 15 settings/master pages now real add/edit/delete (units, brands, categories, warranties, variations, tax, locations, printers, barcodes, discounts, shipments, expense categories, agents, price groups, notification templates)
- [x] Add Purchase (product lines, discount, shipping, payment, auto stock-in) & Add Expense full forms
- [ ] Field-by-field match: Add Product, POS/Add Sale, Contacts
- [x] Import pages (products, opening stock, sales, contacts)
- [x] Roles page from real staff data
- [ ] Print Labels with real barcodes
- [x] POS: type name + Enter adds product
- [x] Dark / light mode fixed for menu, top bar, forms
- [x] Profit report: today, yesterday, 7 days, 30 days, this month, custom range, daily table
- [x] Gorgeous login & inner UI polish, responsive (phone→TV)
- [x] Invoice settings: custom email/phone/address, logo synced with business settings
- [x] Profile photo upload in user menu; menu no longer hidden behind page
- [x] Sales/purchases update customer/supplier dues automatically
- [x] POS terminal header fixed (no white strip behind the purple bar) with its own live clock; app top bar clock visible from tablet up, name/badges/icons readable
- [ ] Field-by-field match: Add Product, POS/Add Sale, Contacts
- [ ] Print Labels with real barcodes
- [ ] Publish (Publish button gives the public link)
- [x] POS manual price per item; home profit/all-time profit/net due cards from real bills with per-product/bill details; loose stock saved with decimals

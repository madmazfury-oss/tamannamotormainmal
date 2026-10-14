# TAMANNA MOTORS Migration Roadmap

- [x] Apply database schema via migration
- [x] Seed data bundled with app (importedTamannaData.json: products, sales, purchases, contacts)
- [x] Port React app into TanStack Start route (src/tamanna/, route /)
- [x] Replace old Supabase/Firebase clients with Lovable Cloud client (sync_documents table + realtime)
- [x] Remove Firebase/Express/Drizzle dependencies
- [x] Verify build + login + dashboard in preview
- [x] Sign in to hisabnikash, inventory modules (counts match existing app data)
- [x] All hisabnikash data loaded into cloud database (521 products, 83 contacts, 840 sales, 248 purchases, 6 expenses, 2 returns, 2 adjustments)
- [ ] Email sign-up & login (next)
- [ ] Premium redesign
- [ ] Missing sections: returns, stock adjustment, cash/ledger, profit & loss

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep home-dashboard visuals scoped to `.tm-dashboard` and use global `home-*` semantic tokens; this isolates its theme from legacy module styling without changing business calculations.
- Scope sign-in visuals to `.tm-excavator-*` with global `auth-*` semantic tokens and shared Button controls so legacy dashboard themes cannot override the entry screen.

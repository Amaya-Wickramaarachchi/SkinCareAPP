# Development Workflow

## Branching Strategy
- `main`: Production-ready code only
- `feature/*`: Feature development branches
- `fix/*`: Bug fix branches

## Code Review Process
1. Create PR from feature/fix branch
2. Request review (for individual projects, review your own code)
3. Address any comments
4. Merge when approved

## Testing Protocol
- Manual testing for all changes
- Document test cases in PR description

## Release Process
1. Merge to `main`
2. Run `npm run release` to update changelog/version
3. Push tags: `git push --follow-tags`

# Incident Response Protocol

## Monitoring Tools
- GitHub Actions CI/CD pipeline
- Checkly synthetic monitoring
- Sentry error tracking (optional)

## Severity Levels
1. **Critical**: Application completely unavailable
2. **High**: Core functionality broken
3. **Medium**: Minor functionality issues
4. **Low**: Cosmetic issues

## Response Procedure
1. **Identify**: Monitor alerts from Checkly/Sentry
2. **Assess**: Determine severity level
3. **Contain**: If critical, roll back last deployment
4. **Resolve**: Create fix branch and deploy
5. **Review**: Document root cause in GitHub issue

## Communication
- Update GitHub issue with status
- For critical issues, notify stakeholders via email

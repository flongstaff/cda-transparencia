# Contributing Guide

## Welcome!

Thank you for your interest in contributing to the Carmen de Areco Transparency Portal! This document provides guidelines and processes for contributing to the project.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming and inclusive environment for all contributors.

## How to Contribute

### Reporting Issues

#### Bug Reports
Before submitting a bug report, please check if the issue has already been reported. If not, create a new issue with:
- A clear and descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots or code examples if applicable
- Environment information (OS, browser, Node.js version, etc.)

#### Feature Requests
We welcome feature requests! Please create an issue with:
- A clear and descriptive title
- Detailed description of the proposed feature
- Use cases and benefits
- Any implementation ideas or suggestions

### Code Contributions

#### Getting Started
1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or bug fix
4. Make your changes
5. Write tests if applicable
6. Ensure all tests pass
7. Submit a pull request

#### Branch Naming
Use descriptive branch names:
- `feature/new-feature-name`
- `bugfix/issue-description`
- `docs/documentation-update`
- `refactor/code-improvement`

#### Pull Request Process
1. Ensure your code follows the project's coding standards
2. Write clear, descriptive commit messages
3. Include tests for new functionality
4. Update documentation as needed
5. Describe your changes in the pull request description
6. Link to any related issues
7. Request review from maintainers

### Development Setup

See the [Development Guide](../development/development-guide.md) for detailed setup instructions.

## Coding Standards

### General Principles
- Write clean, readable, and maintainable code
- Follow established patterns and conventions
- Write comprehensive documentation and comments
- Prioritize security and performance
- Ensure accessibility compliance

### TypeScript
- Use strong typing for all functions and variables
- Define interfaces for complex data structures
- Use generics where appropriate
- Enable strict TypeScript compiler options

### React
- Use functional components with hooks
- Follow the Container/Presentational pattern
- Use React Context for global state management
- Implement proper error boundaries
- Write component tests

### Backend (Node.js/Express)
- Use Express.js middleware pattern
- Implement proper error handling
- Use Sequelize ORM for database operations
- Follow RESTful API design principles
- Write comprehensive API tests

### Database (PostgreSQL)
- Use proper indexing for frequently queried fields
- Follow normalization principles
- Use transactions for complex operations
- Implement proper constraints and validations

### CSS/Tailwind
- Use Tailwind CSS utility classes
- Follow the BEM naming convention for custom classes
- Maintain consistent spacing and typography
- Ensure responsive design

## Testing

### Test Coverage
- Aim for >80% test coverage for new features
- Write unit tests for business logic
- Write integration tests for API endpoints
- Write end-to-end tests for critical user flows

### Testing Tools
- **Frontend**: Jest, React Testing Library
- **Backend**: Jest, Supertest
- **End-to-end**: Cypress (planned)

### Running Tests
```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# Run tests with coverage
npm test -- --coverage
```

## Documentation

### When to Update Documentation
- When adding new features
- When changing existing functionality
- When fixing bugs that affect usage
- When improving developer experience

### Documentation Style
- Use clear, concise language
- Include examples where appropriate
- Keep documentation up to date with code changes
- Use consistent formatting and structure

### Documentation Locations
- **User Documentation**: `docs/` directory
- **API Documentation**: Inline code comments and API reference
- **Code Comments**: Inline with complex logic
- **README**: Project overview and quick start guide

## Code Review Process

### Review Criteria
- Code correctness and functionality
- Adherence to coding standards
- Test coverage and quality
- Documentation completeness
- Performance considerations
- Security implications
- Accessibility compliance

### Review Timeline
- Initial review within 48 hours
- Follow-up reviews within 24 hours
- Merge after approval from at least one maintainer

### Review Feedback
- Be constructive and respectful
- Provide specific suggestions for improvement
- Explain the reasoning behind feedback
- Offer help with implementation if needed

## Community

### Communication Channels
- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For general questions and community discussion
- **Email**: For sensitive or private communications

### Community Roles
- **Maintainers**: Project core contributors with merge rights
- **Contributors**: Anyone who contributes code, documentation, or feedback
- **Users**: Anyone who uses the project

### Recognition
We recognize and appreciate all contributions:
- Code contributions
- Documentation improvements
- Bug reports
- Feature requests
- Community support
- Translation efforts

## Security

### Reporting Security Issues
Please report security vulnerabilities to [security email] rather than creating public issues.

### Security Best Practices
- Follow the principle of least privilege
- Validate and sanitize all inputs
- Use secure coding practices
- Keep dependencies up to date
- Implement proper authentication and authorization

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [LICENSE](../../LICENSE).

## Getting Help

If you need help with contributing:
1. Check the documentation
2. Look at existing code examples
3. Ask questions in GitHub Discussions
4. Contact maintainers directly

## Recognition

Contributors are recognized in:
- Release notes
- Contributor list in documentation
- GitHub contributor graph
- Social media announcements (for significant contributions)

Thank you for helping make the Carmen de Areco Transparency Portal better for everyone!
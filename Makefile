test:
	@node node_modules/.bin/lab -a @hapi/code
test-cov:
	@node node_modules/.bin/lab --coverage-all -a @hapi/code
test-cov-html:
	@node node_modules/.bin/lab -a @hapi/code -r html -o coverage.html

.PHONY: test test-cov test-cov-html
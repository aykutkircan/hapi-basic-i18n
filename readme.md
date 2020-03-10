# hapi-basic-i18n

## This plugin is migrated version of [https://github.com/ubaltaci/hapi-basic-i18n](hapi-basic-i18n) for Hapi@v19.

## For test reports: [Test Report](coverage.html)
* Plugin options w/ registration;

	```js
	await server.register([
    {
        register: require("hapi-basic-i18n"),
        options: {
			locale_path: "<absolutePath>",
			cookie_name: "language",
			default_language: "EN",
			available_languages: ["EN"]
        }
    }]);
    
   ```

* In view context:

	```js
	{{i18n "wtf"}}
	```

* In route handler:

	```js
	function(request, h) {
		return request.i18n("wtf");
	}
	```




* Simply

	```js
	// en.js
	module.exports = {
		"Hello": "Hello {0}!",
	};
	
	// in route handler
	console.log(request.i18n("Hello", "John"));
	
	// in view 
	{{i18n "Hello" "John"}}
	
	// Both outputs are "Hello John!"
	```
	
	



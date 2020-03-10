/**
 *
 * @File: index.js
 * @Reference: http://hapijs.com/api#plugin-interface
 *
 */

var Hoek = require("@hapi/hoek");
var i18n = require("./i18n");

var internals = {};
internals.defaults = {
    locale_path: "./config/languages",
    cookie_name: "language",
    default_language: "en",
    available_languages: ["en", "tr"]

};

const plugin = {};
const register = async function (server, options) {
    try {
        options = Hoek.applyToDefaults(internals.defaults, options);
        console.log("OPTS", options)
        // Insert i18n into view context
        var language = options.default_language;

        server.ext("onPreResponse", async function (request, h) {

            var response = request.response;

            // if response type view!
            if (response.variety === "view") {
                response.source.context = response.source.context || {};
                response.source.context.i18n = request.i18n;
            }
            console.log("response", response)
            return response
        });

        //// Insert i18n into view context
        server.ext("onPostAuth", async function (request, h) {

            if (request.params["language"]) {
                language = request.params["language"];
            }
            else if (request.yar && request.yar.get) {
                language = request.yar.get(options.cookie_name) || language;
            }

            if (options.available_languages.indexOf(language) != -1) {
                request.i18n = i18n(language, options.locale_path);
            }
            else {
                if (language) {
                    console.log(language + " => part is not in the available languages: " + options.available_languages.join(","));
                }
                request.i18n = i18n(options.default_language, options.locale_path);
            }

            request.i18nWithLanguage = function (language) {
                return i18n(language, options.locale_path);
            };

            return h.continue();
        });

    } catch (error) {
        console.error(error)
    }
};

exports.plugin = {
    name: "hapi-basic-i18n",
    pkg: require("../package.json"),
    version: "2.0.0",
    register
};

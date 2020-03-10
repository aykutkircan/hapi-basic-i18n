// Load modules
const Hapi = require('@hapi/hapi');
const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const Path = require("path");
const Vision = require('@hapi/vision');
const Yar = require('@hapi/yar');

// Test Locales
const locale_path = Path.join(__dirname, "/languages");
// Test shortcuts
const lab = exports.lab = Lab.script();

const { describe, it, beforeEach } = lab;

const { expect, fail } = Code;

describe("Hapi Basic i18n", function () {
    let server;

    beforeEach(async function () {
        try {
            server = new Hapi.Server();
            await server.start();

        } catch (error) {
            console.error(error);
        }
    });
    
    it("Must returns valid localized strings for EN", async function () {
        try {
            await server.register({
                plugin: require("../"),
                options: {
                    locale_path,
                    default_language: "EN",
                    available_languages: ["EN", "TR"]
                }
            })
            
            server.route({
                method: 'GET',
                path: '/{language?}',
                config: {
                    handler: function (request, h) {
                        expect(request.i18n).to.exist();
                        const localized = {
                            hello: request.i18n("Hello"),
                            say_hello_to: request.i18n("Say Hello To", "Isaac"),
                            number: request.i18n("1"),
                            number_not_exist: request.i18n(198),
                            xxx: request.i18n("XXX"),
                            not_exist: request.i18n("Hohoho")
                        };
                        return {localized}
                    }
                }
            });
    
            const res = await server.inject("/en");

            expect(res.result).to.exist();
            expect(res.result.localized).to.exist();
            
            const localized = res.result.localized;
            
            expect(localized.hello).to.equal("Hello!");
            expect(localized.say_hello_to).to.equal("Hello Isaac!");
            expect(localized.number).to.equal("Number 1");
            expect(localized.xxx).to.equal("EN XX");
            expect(localized.number_not_exist).to.equal("198");
            expect(localized.not_exist).to.equal("Hohoho");
        } catch (err) {
            expect(err).to.not.exist();
        }
    });

    it("Must returns valid localized strings from default language when avaiable languages mismatch with default one", async function () {
        try {
            await server.register({
                plugin: require("../"),
                options: {
                    locale_path,
                    default_language: "EN",
                    available_languages: ["TR"]
                }
            })

            server.route({
                method: 'GET',
                path: '/{language?}',
                config: {
                    handler: function (request, h) {
                        expect(request.i18n).to.exist();

                        const localized = { hello: request.i18n("Hello") };
                        return {localized}
                    }
                }
            });

            const res = await server.inject("/")
            expect(res.result).to.exist();
            expect(res.result.localized).to.exist();

            const localized = res.result.localized;

            expect(localized.hello).to.equal("Hello!");
        } catch (err) {
            expect(err).to.not.exist();
        }
    });

    it("Must returns valid localized strings for TR", async function () {
        try {
            await server.register({
                plugin: require("../"),
                options: {
                    locale_path,
                    default_language: "TR",
                    available_languages: ["EN", "TR"]
                }
            })

            server.route({
                method: 'GET',
                path: '/{language?}',
                config: {
                    handler: function (request, h) {
                        expect(request.i18n).to.exist();
                        
                        const localized = {
                            hello: request.i18n("Hello"),
                            say_hello_to: request.i18n("Say Hello To", "Isaac"),
                            number: request.i18n("1"),
                            xxx: request.i18n("XXX"),
                            not_exist: request.i18n("Hohoho")
                        };

                        return {localized}
                    }
                }
            });

            const res = await server.inject("/tr");
            expect(res.result).to.exist();
            expect(res.result.localized).to.exist();
            
            const localized = res.result.localized;
            
            expect(localized.hello).to.equal("Merhaba!");
            expect(localized.say_hello_to).to.equal("Selam Isaac!");
            expect(localized.number).to.equal("1 Numara");
            expect(localized.xxx).to.equal("XXX");
            expect(localized.not_exist).to.equal("Hohoho");
        } catch (err) {
            expect(err).to.not.exist();
        }
    });

    it("Must return view includes all locales", async function () {
        try {
            await server.register(Vision);
            await server.views({
                engines: {
                    html: require("handlebars") // means .ext is .html
                },
                path: Path.join(__dirname, 'views'),
                isCached: false
            });

            await server.register({
                plugin: require("../"),
                options: {
                    locale_path,
                    default_language: "EN",
                    available_languages: ["EN", "TR"]
                }
            })

            server.route({
                method: 'GET',
                path: '/',
                config: {
                    handler: function (request, h) {
                        expect(request.i18n).to.exist();

                        return h.view("index");
                    }
                }
            });

            const res = await server.inject("/")
            const tokens = res.result.split("\n");

            expect(tokens[2]).to.equal("Hello!");
            expect(tokens[3]).to.equal("Hello Isaac!");

        } catch (err) {
            expect(err).to.not.exist();
        }
    });

    it("Must throw error cause invalid path", async function () {
        try {

            await server.register({
                plugin: require("../"),
                options: {
                    locale_path: "/somethingwrong",
                    default_language: "EN",
                    available_languages: ["EN", "TR"]
                }
            })

            server.route({
                method: 'GET',
                path: '/',
                config: {
                    handler: function (request, h) {
                        const localized = {
                            hello: request.i18n("Hello"),
                            say_hello_to: request.i18n("Say Hello To", "Isaac"),
                            number: request.i18n("1"),
                            xxx: request.i18n("XXX"),
                            not_exist: request.i18n("Hohoho")
                        };

                        return {localized}
                    }
                }
            });

            const res = await server.inject("/")
            expect(res.result).to.include({ statusCode: 500})

        } catch (err) {
            fail(err);
        }
    });

    it("Must get language from cookie", async function () {
        try {
            await server.register({
                plugin: Yar,
                options: {
                    storeBlank: false,
                    cookieOptions: {
                        password: 'the-password-must-be-at-least-32-characters-long',
                        isSecure: true
                    }
                }
            });

            await server.register({
                plugin: require("../"),
                options: {
                    locale_path,
                    default_language: "EN",
                    available_languages: ["EN", "TR"]
                }
            })

            server.ext("onPreAuth", async function (request, h) {
                request.yar.set("language", "TR")

                return h.continue;
            });


            server.route({
                method: 'GET',
                path: '/{language?}',
                config: {
                    handler: function (request, h) {

                        expect(request.yar).to.exist();
                        const localized = {
                            hello: request.i18n("Hello"),
                            say_hello_to: request.i18n("Say Hello To", "Isaac"),
                            number: request.i18n("1"),
                            xxx: request.i18n("XXX"),
                            not_exist: request.i18n("Hohoho")
                        };

                        return {localized}
                    }
                }
            });

            const res = await server.inject("/")
            expect(res.result).to.exist();
            expect(res.result.localized).to.exist();
            
            const localized = res.result.localized;
            
            expect(localized.hello).to.equal("Merhaba!");
            expect(localized.say_hello_to).to.equal("Selam Isaac!");
            expect(localized.number).to.equal("1 Numara");
            expect(localized.xxx).to.equal("XXX");
            expect(localized.not_exist).to.equal("Hohoho");

        } catch (err) {
            expect(err).to.not.exist();
        }
    });
})
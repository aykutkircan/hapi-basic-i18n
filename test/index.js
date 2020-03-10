// Load modules
const Hapi = require('@hapi/hapi');
const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const Hoek = require('@hapi/hoek');
const Path = require("path");
const Vision = require('@hapi/vision');

// Declare internals
const internals = {};

// Test shortcuts
const lab = exports.lab = Lab.script();

const { describe, it, beforeEach } = lab;

const { expect } = Code;

describe("Hapi Basic i18n", function () {
    let server;

    beforeEach(async function () {
        try {
            server = new Hapi.Server();
            await server.start();

            console.log(server.inject);
        } catch (error) {
            console.error(error);
        }
    });
    
    it("returns valid localized strings for EN", async function () {
        try {
            await server.register({
                plugin: require("../"),
                options: {
                    locale_path: "./test/languages",
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
                        const localized = {
                            hello: request.i18n("Hello"),
                            say_hello_to: request.i18n("Say Hello To", "Isaac"),
                            number: request.i18n("1"),
                            number_not_exist: request.i18n(198),
                            xxx: request.i18n("XXX"),
                            not_exist: request.i18n("Hohoho")
                        };
                        return localized
                    }
                }
            });
    
            await server.inject("/", function (res) {
                expect(res.result).to.exist();
                expect(res.result.localized).to.exist();
                
                const localized = res.result.localized;
                
                expect(localized.hello).to.equal("Hello!");
                expect(localized.say_hello_to).to.equal("Hello Isaac!");
                expect(localized.number).to.equal("Number 1");
                expect(localized.xxx).to.equal("EN XX");
                expect(localized.number_not_exist).to.equal("198");
                expect(localized.not_exist).to.equal("Hohoho");
            });
        } catch (err) {
            expect(err).to.not.exist();
        }
    });

    it("returns valid localized strings from default language when avaiable languages mismatch with default one", async function () {
        try {
            await server.register({
                plugin: require("../"),
                options: {
                    locale_path: "./test/languages",
                    default_language: "EN",
                    available_languages: ["TR"]
                }
            })

            server.route({
                method: 'GET',
                path: '/',
                config: {
                    handler: function (request, h) {
                        expect(request.i18n).to.exist();

                        const localized = { hello: request.i18n("Hello") };
                        return localized
                    }
                }
            });

            await server.inject("/", function (res) {
                expect(res.result).to.exist();
                expect(res.result.localized).to.exist();

                const localized = res.result.localized;

                expect(localized.hello).to.equal("Hello!");
            });
        } catch (err) {
            expect(err).to.not.exist();
        }
    });

    it("returns valid localized strings for TR", async function () {
        try {
            await server.register({
                plugin: require("../"),
                options: {
                    locale_path: "./test/languages",
                    default_language: "TR",
                    available_languages: ["EN", "TR"]
                }
            })

            server.route({
                method: 'GET',
                path: '/',
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

                        return localized
                    }
                }
            });

            await server.inject("/", function (res) {
                expect(res.result).to.exist();
                expect(res.result.localized).to.exist();
                
                const localized = res.result.localized;
                
                expect(localized.hello).to.equal("Merhaba!");
                expect(localized.say_hello_to).to.equal("Selam Isaac!");
                expect(localized.number).to.equal("1 Numara");
                expect(localized.xxx).to.equal("XXX");
                expect(localized.not_exist).to.equal("Hohoho");
            );
        } catch (err) {
            expect(err).to.not.exist();
        }
    });

    it("returns ..", async function () {
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
                    locale_path: "./test/languages",
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
                        var localized = {
                            hello: request.i18n("Hello")
                        };
                        return h.view("index");
                    }
                }
            });

            await server.inject("/", function (res) {
                var tokens = res.result.split("\n");

                expect(tokens[2]).to.equal("Hello!");
                expect(tokens[3]).to.equal("Hello Isaac!");

            });
        } catch (err) {
            console.error(err);
            expect(err).to.not.exist();
        }
    });
})
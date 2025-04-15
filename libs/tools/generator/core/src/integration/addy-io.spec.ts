import { mock } from "jest-mock-extended";

import { ForwarderContext } from "../engine";

import { AddyIo, AddyIoSettings } from "./addy-io";

describe("Addy.io forwarder", () => {
  const context = mock<ForwarderContext<AddyIoSettings>>();

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("authenticate", () => {
    it("returns a bearer header with the token", () => {
      context.authenticationToken.mockReturnValue("token");
      const result = AddyIo.authenticate(null, context);

      expect(result).toEqual({ Authorization: "Bearer token" });
      expect(context.authenticationToken).toHaveBeenCalled();
    });
  });

  describe("settings", () => {
    it("should pass through deserialization", () => {
      const value: any = {};
      const result = AddyIo.forwarder.settings.deserializer(value);
      expect(result).toBe(value);
    });
  });

  describe("importBuffer", () => {
    it("should pass through deserialization", () => {
      const value: any = {};
      const result = AddyIo.forwarder.importBuffer.options.deserializer(value);
      expect(result).toBe(value);
    });
  });

  describe("createForwardingEmail", () => {
    describe("url", () => {
      it("returns the alias path", () => {
        context.baseUrl.mockReturnValue("");

        const result = AddyIo.forwarder.createForwardingEmail.url(null, context);

        expect(result).toEqual("/api/v1/aliases");
      });
    });

    describe("body", () => {
      it("returns the alias path", () => {
        context.emailDomain.mockReturnValue("domain");
        context.generatedBy.mockReturnValue("generated by");

        const result = AddyIo.forwarder.createForwardingEmail.body(null, context);

        expect(context.generatedBy).toHaveBeenCalledWith(null, {
          extractHostname: true,
          maxLength: 200,
        });
        expect(result).toEqual({
          domain: "domain",
          description: "generated by",
        });
      });
    });

    describe("hasJsonPayload", () => {
      it.each([[200], [201]])("returns true when the status is $%i", (status) => {
        const result = AddyIo.forwarder.createForwardingEmail.hasJsonPayload(
          { status } as Response,
          context,
        );
        expect(result).toBeTruthy();
      });
    });

    describe("processJson", () => {
      it("should read the email from the response", () => {
        const json = { data: { email: "foo@example.com" } };
        const result = AddyIo.forwarder.createForwardingEmail.processJson(json, context);
        expect(result).toEqual(["foo@example.com"]);
      });
    });
  });
});

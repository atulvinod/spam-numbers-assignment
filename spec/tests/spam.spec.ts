import "jasmine";
import * as spamService from "@src/services/spam.service";
import * as spamRepo from "@src/repos/spam.repo";
import errors from "@src/other/errors";

describe("test cases for spam", () => {
    it("should create a spam report", async () => {
        spyOn(spamRepo, "createSpamReport").and.returnValue(
            Promise.resolve({ id: 1 }),
        );
        const result = await spamService.createSpamReport({
            phoneNumber: "1234567890",
            countryCode: "+10",
            markedByUserId: 1,
        });
        expect(result).toEqual({ id: 1 });
    });
    it("should throw error on already created spam report", async () => {
        spyOn(spamRepo, "createSpamReport").and.throwError(
            errors.ALREADY_MARKED_SPAM,
        );
        try {
            await spamService.createSpamReport({
                phoneNumber: "1234567890",
                countryCode: "+19",
                markedByUserId: 1,
            });
        } catch (error) {
            expect(error).toEqual(errors.ALREADY_MARKED_SPAM);
        }
    });
});

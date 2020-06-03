import "jest";
import { sanitizeText, removeBlanks } from "../../util/sanitizer";

describe("example", () => {

    it("should remove inline latex", () => {
        const text = `
        #The math
        
        The math should be skipped $x^2 fx dx$
        `;

        const output = sanitizeText(text);

        expect(output).not.toContain("$x^2 fx dx$");
    });

    it("should remove block math", () => {
        const text = `
        #Math
        An block equation:
        $$x^2 fx dx$$
        `;

        const output = sanitizeText(text);
        expect(output).not.toContain("x^2 fx dx");
    });

    it("should remove empty tokens", () => {
        const tokens = [
            "#",
            "some",
            "1",
            "  ",
            "< %",
            "   ",
            `
            `
        ];

        const output = removeBlanks(tokens);

        for(const item of output) {
            expect(["some", "1"]).toContain(item);
        }
    });
});
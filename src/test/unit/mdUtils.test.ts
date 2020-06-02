import { sanitizeLatex } from '../../util/mdUtils';

const markdown = `The Gamma Distribution generalizes the Exponential r.v, where the Exponential r.v is the waiting time for the first success under condition of memorylessnes . The gama r.v represents the total waiting time for multiple successes. We can view the Gamma distribution as a sum of i.i.d Exponential r.v.s. Of we can see the Gamma as the continuous analog of the Negative Binomial distribution. 

Notation of a Gamma r.v.s:

$X \sim Gamma(a,\lambda)$

PDF of the Gamma distribution:

In terms of shape $(k)$ and scale $(\theta)$
$$f(x; k, \theta) = \frac{1}{\theta^k} \frac{1}{\Gamma(k)}x^{k-1} e^{-\frac{x}{\theta}}$$

In terms of shape ($\alpha$) and rate ($\theta$):

$$ f(x; \alpha, \beta) = \beta^{\alpha} \frac{1}{\Gamma(\alpha)}x^{\alpha -1} e^{-\beta x}, x> 0, \text{ and } \alpha, \beta> 0$$

$$
f(x; k, \theta) = \frac{1}{\theta^k} \frac{1}{\Gamma(k)}x^{k-1} e^{-\frac{x}{\theta}}
$$

Relative:
![](../some_folder/someImage.png)

Absolute
![1920px-Gamma_distribution_pdf.svg](1920px-Gamma_distribution_pdf.svg.png)`;


describe("Markdown santization", () => {
    it("sanitize latex", () => {
        const sanitized = sanitizeLatex(markdown);
        console.log(sanitized);
        expect(sanitized.includes("\\((k)\\)")).toBe(true);
        expect(sanitized.includes("\\((\theta)\\)")).toBe(true);
        expect(sanitized.includes("\\[f(x; k, \theta) = \frac{1}{\theta^k} \frac{1}{\Gamma(k)}x^{k-1} e^{-\frac{x}{\theta}}\\]")).toBe(true);
        expect(sanitized.includes("(\\(\alpha\\))")).toBe(true);
    });
});
import * as assert from 'assert';
import { sanitizeLatex } from '../../util/mdUtils';

const a = `The Gamma Distribution generalizes the Exponential r.v, where the Exponential r.v is the waiting time for the first success under condition of memorylessnes . The gama r.v represents the total waiting time for multiple successes. We can view the Gamma distribution as a sum of i.i.d Exponential r.v.s. Of we can see the Gamma as the continuous analog of the Negative Binomial distribution. 

Notation of a Gamma r.v.s:

$X \sim Gamma(a,\lambda)$

PDF of the Gamma distribution:

In terms of shape $(k)$ and scale $(\theta)$
$$f(x; k, \theta) = \frac{1}{\theta^k} \frac{1}{\Gamma(k)}x^{k-1} e^{-\frac{x}{\theta}}$$

In terms of shape ($\alpha$) and rate ($\theta$):

$$ f(x; \alpha, \beta) = \beta^{\alpha} \frac{1}{\Gamma(\alpha)}x^{\alpha -1} e^{-\beta x}, x> 0, \text{ and } \alpha, \beta> 0$$

![1920px-Gamma_distribution_pdf.svg](1920px-Gamma_distribution_pdf.svg.png)`;


describe("Find all latex should", () => {
    it("stuff", () => {
        console.log(a);
        console.log(sanitizeLatex(a));
        assert.equal(1 ,1);
    });
});
import * as assert from 'assert';
import { coverage, tokenize, LCS } from '../../util/flashCardCoverage';
const main = `# Heaps
A heap is a binary tree, that satisfies the following properties:
1. Heap order property
2. Complete Binary tree property

**Heap order property**
In a heap T, for every position p other than the root, the key stored at p is greater than or equal to the key stored at ps parent.

This enforces the fact that the smallest key is always at the root. And as we traverse from the root we get larger values.

**Complete Binary tree property**
A heap T is a complete binary tree if levels $0, 1, 2, /cdots,  h - 1$ of T have the maximum number of nodes possible and the remaining nodes at level h reside in the leftmost possition to that level

![Heap Example](Heaps.assets/heap.png)

From this we get that the heap storing n elements has height long n.

## Implementation of a heap

Since we alway know the height of the heap form the number of elements, we can perfrom update operations on a heap in time proportional to its height. Thus these operations will run in logarithmic time 

1. **Adding elments to a heap**
To maintain the complete binary tree property, every new node should be placed at a postion p, that is the right most node at the bottom level of the tree, or as the left most position on a new level, if the bottom is already full

2. **Up-Heap bubling After insertion**
After insertion the heap-order property may be violated hence we may need to swtich it with its parrent. We repeat this recursively until the heap order property is restored. 

![Bubble up](Heaps.assets/heap_up_bubbling.png)

This swaping process is called up-heap bubbling. This process takes $O^(\log n)$.

1. **Removing the item with Minimum key**
Here we simply remove the root, and replace it with the right most element at the bottom most level of the tree. 

4. **Down-heap Bubbling property after removal**

Now heap order property is violated, and we need to swap with its children recursively. 

![Bubble down](Heaps.assets/bubble_down.png)

## Array based representation of a complete binary tree
The array-based representation of a binary tree is especially suitable for a complete binary tree T.We recall that in this implementation, the elements of T are stored in an array-based list A such that the element at position p in T is stored in A with index equal to the level number f(p) of p,deﬁned as follows:

* If p is the root of T,then f(p)= 0.
* If p is the left child of position q,then f(p)= 2 f(q)+1.
* If p is the right child of position q,then f(p)= 2 f(q)+2.

With this implementation, the elements of T have contiguous indices in the range [0,n−1] and the last position of T is always at index n−1, where n is the number
of positions of T.

![Array Heap](Heaps.assets/array_heap.png)

# Bottom-Up heap construction
If we have all the elements of the heap beforehand we can construct the heap in $O(n)$.

![Bottom up](Heaps.assets/bottom_up.png)`;


const card1 = `# Bottom-Up heap construction
If we have all the elements of the heap beforehand we can construct the heap in $O(n)$.

![Bottom up](Heaps.assets/bottom_up.png)`;

const card2 = `A heap is a binary tree, that satisfies the following properties:
1. Heap order property
2. Complete Binary tree property

**Heap order property**
In a heap T, for every position p other than the root, the key stored at p is greater than or equal to the key stored at ps parent.

This enforces the fact that the smallest key is always at the root. And as we traverse from the root we get larger values.

**Complete Binary tree property**
A heap T is a complete binary tree if levels $0, 1, 2, /cdots,  h - 1$ of T have the maximum number of nodes possible and the remaining nodes at level h reside in the leftmost possition to that level`;

const card3 = `
Since we alway know the height of the heap form the number of elements, we can perfrom update operations on a heap in time proportional to its height. Thus these operations will run in logarithmic time 

1. **Adding elments to a heap**
To maintain the complete binary tree property, every new node should be placed at a postion p, that is the right most node at the bottom level of the tree, or as the left most position on a new level, if the bottom is already full

2. **Up-Heap bubling After insertion**
After insertion the heap-order property may be violated hence we may need to swtich it with its parrent. We repeat this recursively until the heap order property is restored. 
`;

const card4 = `
If we have all the elements of the heap beforehand we can construct the heap in $O(n)$.

![Bottom up](../Heaps.assets/bottom_up.png)`;

describe("Converage", () => {

    it("LCS", () => {
        // const mainTokens = tokenize(main);
        const cardTokens = tokenize(card1);

        // const lcs = LCS(mainTokens, cardTokens);
    });
    it("coverage card1", () => {
        const res = coverage(main, new Map([['card1', card1]]));
        const card1Coverage = res.get('card1')!;
        const { startPosition } = card1Coverage[0];
        const { endPosition } = card1Coverage[card1Coverage.length - 1];
        console.log(main.slice(startPosition, endPosition));
   
    });
    
    it("coverage card4", () => {
        const res = coverage(main, new Map([['card2', card2]]));
        const cardCoverage = res.get('card2')!;
        const { startPosition } = cardCoverage[0];
        const { endPosition } = cardCoverage[cardCoverage.length - 1];
        console.log(main.slice(startPosition, endPosition));
        console.log(cardCoverage.slice(cardCoverage.length -10, cardCoverage.length));
    });
});
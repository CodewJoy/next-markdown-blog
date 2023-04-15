---
title: 'List Virtualization (windowing)'
date: 'April 15, 2023'
readTime: '30 min'
---
###### tags: `front-end` `efficiency`

## Introduction
In web development, rendering large sets of data can be a challenge, especially when it comes to performance. List Vitualization are one solution to this problem.
[React Doc](https://legacy.reactjs.org/docs/optimizing-performance.html#virtualize-long-lists
)
Issues of rendering large sets of data:
- Long initial loading time
- Large memory usage
- Easily dropped frames
- Unresponsive

## What are List Vitualization?
- A technique to render only the visible part of a long list of items.
- This technique involves rendering only the items visible on the screen and unmounting the ones that are not visible.
- In traditional web development, rendering all items in the DOM can lead to performance issues, especially when dealing with a large dataset.
- List Vitualization solve this problem by only rendering the visible items and reducing the number of DOM nodes in memory, leading to better performance.
- Using a virtualized list can display a large amount of data without affecting the user experience.
![](https://i.imgur.com/5w9Brao.png)


![](https://hackmd.io/_uploads/rJcifzjFq.png)
[Image](https://bvaughn.github.io/forward-js-2017/#/12/5) by Brian Vaughn

## Props & Cons
### Pros
- Can render a large number of list items in large datasets while maintaining good performance and speed
- Help developers better manage data and reduce the time and resources needed for page layout
### Cons
- Need to use special libraries or frameworks, which can increase code complexity and learning costs
- May have a negative impact on search engine optimization (SEO)

## When to use? 
- Social Media Feeds (such as Facebook, Twitter, and Instagram)
- E-commerce Websites (have long lists of products to display)
- Data-Intensive Applications (financial dashboards and analytics platforms often have large datasets to display)
- [Application Scenarios](https://bvaughn.github.io/forward-js-2017/#/13/5
)

## How to Use Virtualized Lists?
### Concept: 2 methods to implement list vitulization
- Fixed row height virtualized lists 
    - Pros: 
All rows have the same height. It's simple and can be easily implemented by calculating the number of visible rows that can fit in the visible area. 
    - Cons: 
Cannot handle scenarios where rows have different heights, resulting in display issues such as overlapping or blank spaces.

- Dynamic row height virtualized lists 
    - Props: 
    More flexible because they can handle rows with different heights. Developers need to calculate the height for each row before determining the number of visible rows that can fit in the visible area.
    - Cons: 
    Calculating each row's height can decrease performance, particularly when the elements have complex layouts and structures.

### Implement our own List Vitualization
- Inner Height: The total length of the long list, which is calculated by multiplying the item height by the number of items because each item has a fixed height.
- Window Height: The height of the virtualized list window, which is the visible area. In this minimalist implementation, the value is hardcoded and passed from outside.
- Scroll Top: The distance that the long list has been scrolled, which is the distance from the beginning of the long list (the first item) to the first visible item in the window of the virtualized list.
![](https://i.imgur.com/JzmoyEn.png)

Render use info example
- [use list vitulization](https://codesandbox.io/s/user-info-without-framework-pvtg3u?file=/src/App.js)

### Libraries
Several libraries are available for implementing Virtualized Lists in front-end development.
- ReactJS
    - [react-virtualized](https://www.npmjs.com/package/react-virtualized)
    - [react-window: A smaller alternative to react-virtualized
](https://www.npmjs.com/package/react-window) For commonly used element structures (list & grid)
- VueJS
    - [useVirtualList](https://vueuse.org/core/useVirtualList/)
    - [vue-virtual-scroller](https://github.com/Akryum/vue-virtual-scroller)
    - vue-virtual-scroller list
- Angular
    - [cdk-virtual-scroll-viewport](https://material.angular.io/cdk/scrolling/overview)
- SvelteJS
    - svelte-virtual-list

### react-window
- a rewrite of react-virtualized by the same author 
- aiming to be smaller, faster and more tree-shakeable.

#### List
- render a windowed list (row) of elements, only display rows
- use a Grid (internally) to render rows, relaying props to that inner Grid
- [FixedSizeList](https://react-window.vercel.app/#/examples/list/fixed-size)
- [render-user-info-example-use-react-window](https://codesandbox.io/s/user-info-react-window-s00394?file=/index.js)
- [VariableSizeList](https://react-window.vercel.app/#/examples/list/variable-size)

#### Grid
- renders tabular data with virtualization along the vertical and horizontal axes
- only renders the Grid cells needed to fill itself based on current horizontal/vertical scroll positions.
- [FizedSizeGrid](https://react-window.vercel.app/#/examples/grid/fixed-size)
- [VariableSizeGid](https://react-window.vercel.app/#/examples/grid/variable-size)

## Test frames per second (FPS) meter: no use v.s. use list vitulization
### RAIL Model
- RAIL Model is a performance metric proposed by Google, The goal of RAIL is to provide a better user experience by optimizing these actions
- It focuses on optimizing user experience by breaking it down into key actions, include:
    - tap, 
    - scroll,
    - load...
- RAIL stands for 4 indicators of the Web App Life Cycle
    - Response, 
    - Animation, 
    - Idle,
    - Load

![](https://i.imgur.com/n6hx6NE.png)

## Animation: produce a frame in 10ms
- Most devices currently refresh their screens at a rate of 60 times per second, or 60 frames per second (fps), in order to provide smooth animations.
This means that each frame must be produced in approximately 16 milliseconds (1000ms / 60fps = 16.66ms).
![](https://i.imgur.com/4oOlEpm.png)
- However, because it takes approximately 6 milliseconds for the browser to render each frame, developers aim to complete their work within 10 milliseconds to avoid jittering or lagging in the animation. If the work takes much longer than 10 milliseconds or the frame rate is unstable, it can negatively impact the user's experience. 
(**Notice**: refresh rate of a device may vary depending on the hardware and software configuration, and some devices may be capable of higher or lower refresh rates. Additionally, the amount of time it takes to render a frame may also vary depending on the complexity of the animation and the capabilities of the device.)

### Using The Chrome DevTools FPS meter
- Open the Chrome DevTools and then open the Command Menu by using 
    - Control+Shift+P in Windows 
    - Command+Shift+P in Mac. 
- In the Command Menu, type ‘Show frames’ and pick the first option (should be “Show frames per second (FPS) meter”):
![](https://i.imgur.com/CFIVVo9.png)
- [no use list vitulization](https://codesandbox.io/s/user-info-no-list-vitulize-sf6odf?file=/src/App.js)
![](https://i.imgur.com/7lFyC8i.png)

- [render-user-info-example-use-react-window](https://codesandbox.io/s/user-info-react-window-s00394?file=/index.js)
![](https://i.imgur.com/9BnP6QE.png)

## [Pitfalls that someone else has encountered](https://ithelp.ithome.com.tw/articles/10299969)

## Conclusion
When we has huge Data Rendering issue, 2 solutions compare as below
- list virtualization 
    - more suitable when you have a fixed dataset that can be loaded upfront
    - fetch data => render the data if needed
- [React infinite scroll - use lazy loading concept](http://localhost:3001/react-infinite-scroll)
    - more suitable when you have a dynamic and constantly growing dataset.
    - fetch the data if needed => render the data



## Reference
[List Virtualization (windowing)](https://hackmd.io/cU91fnbwQDKFKrhk2b6-sQ?view) [@ChaoTzuJung](https://github.com/ChaoTzuJung
)
[patterns - List Virtualization](https://www.patterns.dev/posts/virtual-lists/)
[今晚，我想來點 Web 前端效能優化大補帖！ ](https://ithelp.ithome.com.tw/users/20113277/ironman/3877)
[Day04 X Core Web Vital & RAIL Model](https://ithelp.ithome.com.tw/articles/10267350)
[Day10 X 實作一個簡單的 Virtualized List 吧！](https://ithelp.ithome.com.tw/articles/10271764)
[Day11 X Lazy Loading](https://ithelp.ithome.com.tw/articles/10272251)
[Quick Tip — Using The Chrome DevTools FPS meter
](https://gilfink.medium.com/quick-tip-using-the-chrome-devtools-fps-meter-1bb400b63f7)
[Day 13 - 為什麼要用 Virtualized List](https://ithelp.ithome.com.tw/articles/10299969)
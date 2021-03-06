# Cylinder

Creates a cylinder model. Inherits methods from [`Model`](/#/documentation/api-reference/model).


## Usage

Create a white Cylinder of radius 2 and height 3.

```js
var whiteCylinder = new Cylinder(gl, {
  radius: 2,
  height: 3,
  colors: [1, 1, 1, 1]
});
```

## Method

### constructor

The constructor for the Cylinder class. Use this to create a new Cylinder.

`var model = new Cylinder(gl, options);`

* nradial - (*number*, optional) The number of vertices for the disk. Default's 10.
* nvertical - (*number*, optional) The number of vertices for the height. Default's 10.
* radius - (*number*) The radius of the cylinder.
* topCap - (*boolean*, optional) Whether to put the cap on the top of the cylinder. Default's false.
* bottomCap - (*boolean*, optional) Whether to put the cap on the bottom
  part of the cylinder. Default's false.

# MP3: Simulating Flight

### Table of Contents

* [Overview](#Overview)



### Overview 

For the third machine problem, you will extend your terrain renderer with a simple flight simulator. Your “plane” will fly over the terrain you generate. You will also add the capability of applying fog to your terrain.



### Simulating Flight

The app will be rendering a view of the terrain from the perspective of someone flying over it. The view should automatically move forward at a fixed speed. The user will control the roll and pitch of the airplane through the arrow keys. The controls should be:

- Pressing the left (right) arrow key will make the plane roll to its left (right)
- Pressing the up (down) arrow key will cause the airplane to pitch up (down)
- Pressing the + (-) key will increase (decrease) the airplane’s speed
- Pressing the ESC key will reset the current view to the initial viewpoint and direction

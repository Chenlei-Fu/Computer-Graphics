/**
 * @fileoverview Particle.js - Class for properties of every particle
 * @author Chenlei Fu <chenlei2@illinois.edu>
 */
/** @global length of canvas */
var m = 3;

/** @global drag */
var drag = 0.6;

/** @global gravity */
var gravity = 10;

/** @global unit normal of walls */
var walls = getUnitNormalWall();

class Particle {
    /**
     * Constructs a Particle object with position, velocity, radius, color, mass
     */
    constructor()
    {
        this.velocity = getVelocity();
        this.radius = getRadius();
        this.position = glMatrix.vec3.fromValues(getDisplacement(this.radius), getDisplacement(this.radius), getDisplacement(this.radius));
        this.color = glMatrix.vec3.fromValues(Math.random(), Math.random(), Math.random());
        this.hitWall = false;
    }

    updateVelocity(t) {
        if(this.hitWall) return;
        // v_new = v_old * d^t - gt
        glMatrix.vec3.scale(this.velocity, this.velocity, Math.pow(drag, t));
        glMatrix.vec3.subtract(this.velocity, this.velocity, getChangedVelocity(t));
    }

    updatePosition(t) {
        if(this.hitWall) return;

        // p_new = p_old + v * t
        let changedPos = glMatrix.vec3.create();
        let old_position = glMatrix.vec3.clone(this.position);
        glMatrix.vec3.scale(changedPos, this.velocity, t);
        glMatrix.vec3.add(this.position, this.position, changedPos);

        let res = collisionDetection(old_position, this.position, this.radius, this.velocity);

        if(res.time !== Infinity) { // has collision
            // update the velocity
            let normalOfWall = glMatrix.vec3.clone(walls[res.wall]);
            let tmp = glMatrix.vec3.dot(this.velocity, normalOfWall);
            let result = glMatrix.vec3.fromValues(2 * tmp, 2 * tmp, 2 * tmp);
            glMatrix.vec3.multiply(result, result, normalOfWall); // 2(v1 * n) n
            glMatrix.vec3.subtract(this.velocity, this.velocity, result); // v2 = v1 - 2(v1 * n) n
            glMatrix.vec3.scale(this.velocity, this.velocity, 0.9); // ||v2|| = c||v1||

            if(Math.floor(res.wall / 2) === 1 && res.wall % 2 === 1 && glMatrix.vec3.length(this.velocity) <=  1) {
                this.velocity = glMatrix.vec3.fromValues(0, 0, 0);
                this.hitWall = true;
            }
        }
    }
}   // class Particle;


//-----------------------------------------------------------------------------
// Helper functions

/**
 * Get displacement for position
 * @return {number}
 */
function getDisplacement(radius) {
    return (Math.random() * 2 - 1) * (m - radius);
}

/**
 * Get a random radius
 * @return {number}
 */
function getRadius() {
    return Math.random() * (0.4 - 0.1) + 0.1;
}

/**
 * Get a random velocity
 * @return {vec3}
 */
function getVelocity() {
    let velocity = glMatrix.vec3.create();
    return glMatrix.vec3.random(velocity, 10);
}

/**
 * calculate the changed velocity by gravity
 * @param t: time elapsed
 */
function getChangedVelocity(t) {
    let acceleration = glMatrix.vec3.fromValues(0, gravity, 0);
    let changedVel = glMatrix.vec3.create();
    glMatrix.vec3.scale(changedVel, acceleration, t);
    return changedVel;
}


/**
 * Collision Detection
 * @param old_position
 * @param new_position
 * @param r
 * @param t
 * @param v
 * @return {{time: number, wall: number}}
 */
function collisionDetection(old_position, new_position, r, v) {
    let t_ = Infinity;
    let wall = -1;
    new_position.forEach(function (pi, index) {
        let tmp_t = 0;
        // check two cases
        if((pi + r) >= m) {
            tmp_t = ((m - r) - old_position[index]) / v[index];
            wall = index * 2;
            if (t_ > tmp_t) {
                t_ = tmp_t;
                wall = index * 2;
            }
        }
        else if ((pi - r) <= -m) {
            tmp_t = ((-m + r) - old_position[index]) / v[index];
            if (t_ > tmp_t) {
                t_ = tmp_t;
                wall = index * 2 + 1;
            }
        }
    })
    return {
        time: t_,
        wall: wall
    };
}

/**
 * Get Unit normals of walls
 * @return {[]}
 */
function getUnitNormalWall() {
    let normals = [];
    for(let i = 0; i < 6; i++) {
        let index = Math.floor(i / 2);
        let tmp = glMatrix.vec3.fromValues(0, 0, 0);
        if(i % 2 === 0) {
            // positive sign
            tmp[index] = 1;
        } else {
            tmp[index] = -1;
        }
        normals.push(tmp);
    }
    console.log(normals);
    return normals;
}

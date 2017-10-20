const Vector2 = {
  create: (x, y) => {
    return {
      x: x,
      y: y,
      copy: function() { return Vector2.create(this.x, this.y) },
      length: function() { return Math.sqrt(this.length2()) },
      length2: function() { return this.dot(this) },
      setLength: function(newLength) { return this.normalize().mul(newLength) },
      normalize: function() {
        const invlen = 1.0 / this.length()
        this.x *= invlen
        this.y *= invlen

        return this
      },
      getNormalized: function() { return this.copy().normalize() },
      add: function(other) {
        if (typeof other === 'number') {
          this.x += other
          this.y += other
        } else {
          this.x += other.x
          this.y += other.y
        }

        return this
      },
      sub: function(other) {
        if (typeof other === 'number') {
          this.x -= other
          this.y -= other
        } else {
          this.x -= other.x
          this.y -= other.y
        }

        return this
      },
      mul: function(scalar) {
        this.x *= scalar
        this.y *= scalar
        return this
      },
      div: function(scalar) {
        this.x /= scalar
        this.y /= scalar
        return this
      },
      dot: function(otherVector) {
        return this.x * otherVector.x + this.y * otherVector.y
      }
    }
  }
}

exports.Vector2 = Vector2

import { MathBase } from "./math-base";

export class Vector3 {
  constructor(public x: number, public y: number, public z: number) { }

  public multiplyNum(num: number): Vector3 {
    return new Vector3(this.x * num, this.y * num, this.z * num);
  }

  public multiplyNumSelf(num: number): Vector3 {
    this.x *= num;
    this.y *= num;
    this.z *= num;
    return this;
  }

  public set(x: number, y: number, z: number): Vector3 {
    this.x = x;
    this.y = y;
    this.z = z;

    return this;
  }

  public length(): number {
    return Math.sqrt(this.lengthQ());
  }

  public lengthQ(): number {
    return Math.pow(this.x, 2)
      + Math.pow(this.y, 2)
      + Math.pow(this.z, 2);
  }

  public add(vector: Vector3): Vector3 {
    return new Vector3(this.x + vector.x, this.y + vector.y, this.z + vector.z);
  }

  public subtract(vector: Vector3): Vector3 {
    return new Vector3(this.x - vector.x, this.y - vector.y, this.z - vector.z);
  }

  public normal(): Vector3 {
    const length = this.length();

    return length < MathBase.eps
      ? new Vector3(0, 0, 0)
      : this.multiplyNum(1 / length);
  }

  public normalize(): Vector3 {
    const length = this.length();

    length < MathBase.eps
      ? this.set(0, 0, 0)
      : this.multiplyNumSelf(1 / length);

    return this;
  }

  public lerp(finish: Vector3, position: number): Vector3 {
    return finish
      .subtract(this)
      .multiplyNum(position)
      .add(this);
  }

  public dot(vector: Vector3): number {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z;
  }

  public cross(vector: Vector3): Vector3 {
    return new Vector3(
      this.y * vector.z - this.z * vector.y,
      this.z * vector.x - this.x * vector.z,
      this.x * vector.y - this.y * vector.x
    );
  }

  public negate(): Vector3 {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;

    return this;
  }
}

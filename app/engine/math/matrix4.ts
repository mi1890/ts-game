import { Vector3 } from "./vector3";

export class Matrix4 {
  public e: number[] = new Array<number>(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  );

  public multiplyMat(other: Matrix4): Matrix4 {
    const result = new Matrix4();
    const a = this;
    const b = other;

    result.e = [
      a.e[0] * b.e[0] + a.e[4] * b.e[1] + a.e[8] * b.e[2] + a.e[12] * b.e[3],
      a.e[1] * b.e[0] + a.e[5] * b.e[1] + a.e[9] * b.e[2] + a.e[13] * b.e[3],
      a.e[2] * b.e[0] + a.e[6] * b.e[1] + a.e[10] * b.e[2] + a.e[14] * b.e[3],
      a.e[3] * b.e[0] + a.e[7] * b.e[1] + a.e[11] * b.e[2] + a.e[15] * b.e[3],
      a.e[0] * b.e[4] + a.e[4] * b.e[5] + a.e[8] * b.e[6] + a.e[12] * b.e[7],
      a.e[1] * b.e[4] + a.e[5] * b.e[5] + a.e[9] * b.e[6] + a.e[13] * b.e[7],
      a.e[2] * b.e[4] + a.e[6] * b.e[5] + a.e[10] * b.e[6] + a.e[14] * b.e[7],
      a.e[3] * b.e[4] + a.e[7] * b.e[5] + a.e[11] * b.e[6] + a.e[15] * b.e[7],
      a.e[0] * b.e[8] + a.e[4] * b.e[9] + a.e[8] * b.e[10] + a.e[12] * b.e[11],
      a.e[1] * b.e[8] + a.e[5] * b.e[9] + a.e[9] * b.e[10] + a.e[13] * b.e[11],
      a.e[2] * b.e[8] + a.e[6] * b.e[9] + a.e[10] * b.e[10] + a.e[14] * b.e[11],
      a.e[3] * b.e[8] + a.e[7] * b.e[9] + a.e[11] * b.e[10] + a.e[15] * b.e[11],
      a.e[0] * b.e[12] + a.e[4] * b.e[13] + a.e[8] * b.e[14] + a.e[12] * b.e[15],
      a.e[1] * b.e[12] + a.e[5] * b.e[13] + a.e[9] * b.e[14] + a.e[13] * b.e[15],
      a.e[2] * b.e[12] + a.e[6] * b.e[13] + a.e[10] * b.e[14] + a.e[14] * b.e[15],
      a.e[3] * b.e[12] + a.e[7] * b.e[13] + a.e[11] * b.e[14] + a.e[15] * b.e[15]
    ];

    return result;
  }

  public multiplyVec(vec: Vector3): Vector3 {
    return new Vector3(
      this.e[0] * vec.x + this.e[4] * vec.y + this.e[8] * vec.z + this.e[12],
      this.e[1] * vec.x + this.e[5] * vec.y + this.e[9] * vec.z + this.e[13],
      this.e[2] * vec.x + this.e[6] * vec.y + this.e[10] * vec.z + this.e[14]
    );
  }

  public multiplyNum(num: number): Matrix4 {
    const mat = new Matrix4();
    for (let i = 0; i < 16; ++i) {
      mat.e[i] = this.e[i] * num;
    }
    return mat;
  }

  public identity(): void {
    this.e = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  public ortho(left: number, right: number, bottom: number, top: number, zNear: number, zFar: number): void {
    this.e = [
      2 / (right - left), 0, 0, 0,
      0, 2 / (top - bottom), 0, 0,
      0, 0, -2 / (zFar - zNear), 0
      - (right + left) / (right - left), -(top + bottom) / (top - bottom), -(zFar + zNear) / (zFar - zNear), 1
    ];
  }
}

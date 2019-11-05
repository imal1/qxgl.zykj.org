export interface IStudent {
  fullName: string;
  id: number;
  number: string;
  policy: boolean;
}

export default interface IStudentAuthResult {
  classId: number;
  className: string;
  grade: string;
  students: IStudent[];
}

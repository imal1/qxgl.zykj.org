export default interface IUpdateStudentsAuthDto {
  schoolCode: string;
  students: Array<{
    id: number;
    policy: boolean;
  }>;
}

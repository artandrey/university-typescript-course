enum StudentStatus {
  Active = 'Active',
  Academic_Leave = 'Academic_Leave',
  Graduated = 'Graduated',
  Expelled = 'Expelled',
}

enum CourseType {
  Mandatory = 'Mandatory',
  Optional = 'Optional',
  Special = 'Special',
}

enum Semester {
  First = 'First',
  Second = 'Second',
}

enum Grade {
  Excellent = 5,
  Good = 4,
  Satisfactory = 3,
  Unsatisfactory = 2,
}

enum Faculty {
  Computer_Science = 'Computer_Science',
  Economics = 'Economics',
  Law = 'Law',
  Engineering = 'Engineering',
}

interface Student {
  id: number;
  fullName: string;
  faculty: Faculty;
  year: number;
  status: StudentStatus;
  enrollmentDate: Date;
  groupNumber: string;
}

interface Course {
  id: number;
  name: string;
  type: CourseType;
  credits: number;
  semester: Semester;
  faculty: Faculty;
  maxStudents: number;
}

interface GradeRecord {
  studentId: number;
  courseId: number;
  grade: Grade;
  date: Date;
  semester: Semester;
}

class UniversityManagementSystem {
  private students: Student[] = [];
  private courses: Course[] = [];
  private grades: GradeRecord[] = [];
  private courseEnrollments: { studentId: number; courseId: number }[] = [];
  private lastStudentId: number = 0;

  // Generates new ID and adds student to the system
  enrollStudent(student: Omit<Student, 'id'>): Student {
    const newStudent: Student = {
      ...student,
      id: ++this.lastStudentId,
    };
    this.students.push(newStudent);
    return newStudent;
  }

  // Validates enrollment conditions and registers student for the course
  registerForCourse(studentId: number, courseId: number): void {
    const student = this.students.find((s) => s.id === studentId);
    const course = this.courses.find((c) => c.id === courseId);

    if (!student || !course) {
      throw new Error('Student or course not found');
    }

    if (student.status !== StudentStatus.Active) {
      throw new Error('Only active students can register for courses');
    }

    if (student.faculty !== course.faculty) {
      throw new Error('Student can only register for courses in their faculty');
    }

    const enrolledStudentsCount = this.courseEnrollments.filter(
      (e) => e.courseId === courseId
    ).length;

    if (enrolledStudentsCount >= course.maxStudents) {
      throw new Error('Course is already full');
    }

    this.courseEnrollments.push({ studentId, courseId });
  }

  setGrade(studentId: number, courseId: number, grade: Grade): void {
    // Checks if student is enrolled
    const enrollment = this.courseEnrollments.find(
      (e) => e.studentId === studentId && e.courseId === courseId
    );

    if (!enrollment) {
      throw new Error('Student is not registered for this course');
    }

    const course = this.courses.find((c) => c.id === courseId);

    // Assigns grade
    this.grades.push({
      studentId,
      courseId,
      grade,
      date: new Date(),
      semester: course!.semester,
    });
  }

  // Validates status change possibility
  updateStudentStatus(studentId: number, newStatus: StudentStatus): void {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    if (
      student.status === StudentStatus.Expelled ||
      student.status === StudentStatus.Graduated
    ) {
      throw new Error('Cannot change status of expelled or graduated student');
    }
    // Updates student status
    student.status = newStatus;
  }

  getStudentsByFaculty(faculty: Faculty): Student[] {
    return this.students.filter((s) => s.faculty === faculty);
  }

  getStudentGrades(studentId: number): GradeRecord[] {
    return this.grades.filter((g) => g.studentId === studentId);
  }

  getAvailableCourses(faculty: Faculty, semester: Semester): Course[] {
    // Filters courses by faculty, semester, and enrollment limit
    return this.courses.filter(
      (c) =>
        c.faculty === faculty &&
        c.semester === semester &&
        this.courseEnrollments.filter((e) => e.courseId === c.id).length <
          c.maxStudents
    );
  }

  calculateAverageGrade(studentId: number): number {
    // Calculates average grade
    const studentGrades = this.grades.filter((g) => g.studentId === studentId);
    if (studentGrades.length === 0) return 0;
    // Sums up grades
    const sum = studentGrades.reduce((acc, curr) => acc + curr.grade, 0);
    // Calculates average grade
    return sum / studentGrades.length;
  }

  getExcellentStudents(faculty: Faculty): Student[] {
    return this.students.filter((student) => {
      // Filters students by faculty
      if (student.faculty !== faculty) return false;

      const averageGrade = this.calculateAverageGrade(student.id);
      return averageGrade >= Grade.Excellent;
    });
  }

  addCourse(course: Course): void {
    this.courses.push(course);
  }
}

function runSimulation() {
  const universityManagementSystem = new UniversityManagementSystem();

  // Add test course
  const testCourse: Course = {
    id: 1,
    name: 'Introduction to Programming',
    type: CourseType.Mandatory,
    credits: 5,
    semester: Semester.First,
    faculty: Faculty.Computer_Science,
    maxStudents: 2,
  };
  universityManagementSystem.addCourse(testCourse);

  // Test student enrollment
  const student1 = universityManagementSystem.enrollStudent({
    fullName: 'John Doe',
    faculty: Faculty.Computer_Science,
    year: 1,
    status: StudentStatus.Active,
    enrollmentDate: new Date(),
    groupNumber: 'CS-11',
  });

  console.assert(student1.id === 1, 'Student should have ID 1');
  console.assert(
    student1.faculty === Faculty.Computer_Science,
    'Student should be in CS faculty'
  );

  // Test course registration
  universityManagementSystem.registerForCourse(student1.id, testCourse.id);

  // Test grade assignment
  universityManagementSystem.setGrade(
    student1.id,
    testCourse.id,
    Grade.Excellent
  );

  const studentGrades = universityManagementSystem.getStudentGrades(
    student1.id
  );
  console.assert(studentGrades.length === 1, 'Student should have one grade');
  console.assert(
    studentGrades[0].grade === Grade.Excellent,
    'Grade should be excellent'
  );

  // Test average grade calculation
  const avgGrade = universityManagementSystem.calculateAverageGrade(
    student1.id
  );
  console.assert(avgGrade === 5, 'Average grade should be 5');

  // Test status update
  universityManagementSystem.updateStudentStatus(
    student1.id,
    StudentStatus.Academic_Leave
  );

  // Test error cases
  try {
    // Should fail - student on academic leave
    universityManagementSystem.registerForCourse(student1.id, testCourse.id);
  } catch (error) {
    console.log('Correctly prevented registration while on academic leave');
  }

  console.log('All tests completed');
}

runSimulation();

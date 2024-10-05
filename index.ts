type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

type TimeSlot =
    | '8:30-10:00'
    | '10:15-11:45'
    | '12:15-13:45'
    | '14:00-15:30'
    | '15:45-17:15';

type CourseType = 'Lecture' | 'Seminar' | 'Lab' | 'Practice';

type Professor = {
    id: number;
    name: string;
    department: string;
};

type Classroom = {
    number: string;
    capacity: number;
    hasProjector: boolean;
};

type Course = {
    id: number;
    name: string;
    type: CourseType;
};

type Lesson = {
    courseId: number;
    professorId: number;
    classroomNumber: string;
    dayOfWeek: DayOfWeek;
    timeSlot: TimeSlot;
};

type ValidationConflictType = 'ProfessorConflict' | 'ClassroomConflict';

type ValidationResult = {
    isValid: boolean;
    conflictType: ValidationConflictType | null;
    conflictWithLesson: Lesson | null;
};

const professors: Professor[] = [];
const classrooms: Classroom[] = [
    {
        number: '101',
        capacity: 30,
        hasProjector: true,
    },
    {
        number: '102',
        capacity: 20,
        hasProjector: false,
    },
];
const courses: Course[] = [
    { id: 1, name: 'Data Structures', type: 'Lecture' },
    { id: 2, name: 'Calculus', type: 'Seminar' },
];
const schedule: Lesson[] = [];

function addProfessor(professor: Professor) {
    professors.push(professor);
}

function addLesson(lesson: Lesson) {
    const validationResult = validateLesson(lesson);
    if (!validationResult.isValid) {
        throw new Error(
            `Conflict: ${
                validationResult.conflictType
            } with lesson${JSON.stringify(validationResult.conflictWithLesson)}`
        );
    }
    schedule.push(lesson);
}

function findAvailableClassrooms(
    timeSlot: TimeSlot,
    dayOfWeek: DayOfWeek
): string[] {
    const occupiedClassrooms = schedule
        .filter(
            (lesson) =>
                lesson.dayOfWeek === dayOfWeek && lesson.timeSlot === timeSlot
        )
        .map((lesson) => lesson.classroomNumber);

    return classrooms
        .filter((classroom) => !occupiedClassrooms.includes(classroom.number))
        .map((classroom) => classroom.number);
}

function getProfessorSchedule(professorId: number): Lesson[] {
    const professor = professors.find(
        (professor) => professor.id === professorId
    );
    if (!professor) {
        throw new Error('Professor was not found');
    }
    return schedule.filter((lesson) => lesson.professorId === professorId);
}

function validateLesson(lesson: Lesson): ValidationResult {
    // search for existing lesson by professor at the same time span
    const professorConflict = schedule.find(
        (candidateLesson) =>
            candidateLesson.professorId === lesson.professorId &&
            candidateLesson.dayOfWeek === lesson.dayOfWeek &&
            candidateLesson.timeSlot === lesson.timeSlot
    );

    if (professorConflict) {
        return {
            conflictType: 'ProfessorConflict',
            conflictWithLesson: professorConflict,
            isValid: false,
        };
    }

    // search for existing lesson by classroom number at the same time span
    const classroomConflict = schedule.find(
        (candidateLesson) =>
            candidateLesson.classroomNumber === lesson.classroomNumber &&
            candidateLesson.dayOfWeek === lesson.dayOfWeek &&
            candidateLesson.timeSlot === lesson.timeSlot
    );

    if (classroomConflict) {
        return {
            conflictType: 'ClassroomConflict',
            conflictWithLesson: classroomConflict,
            isValid: false,
        };
    }

    return { isValid: true, conflictType: null, conflictWithLesson: null };
}

function getClassroomUtilization(classroomNumber: string): number {
    const totalLessons = schedule.filter(
        (lesson) => lesson.classroomNumber === classroomNumber
    ).length;
    const totalSlots = 5 * 5; // 5 days, each day has 5 slots
    return (totalLessons / totalSlots) * 100;
}

function getMostPopularCourseType(): CourseType {
    // counting each course type appearance
    const courseTypeCountRecord = courses.reduce(
        (record, course) => {
            record[course.type]++;
            return record;
        },
        {
            Lab: 0,
            Lecture: 0,
            Practice: 0,
            Seminar: 0,
        } satisfies {
            [key in CourseType]: number;
        }
    );

    // finding lesson type with greatest total
    return Object.keys(courseTypeCountRecord).reduce((a, b) =>
        courseTypeCountRecord[a] > courseTypeCountRecord[b] ? a : b
    ) as keyof typeof courseTypeCountRecord;
}

function reassignClassroom(lessonId: number, newClassroomNumber: string) {
    const lesson = schedule.find((l) => l.courseId === lessonId);
    if (!lesson) {
        throw new Error(`Lesson with id: ${lessonId} was not found`);
    }

    const validationResult = validateLesson(lesson);
    if (!validationResult.isValid) {
        throw new Error(
            `Conflict: ${
                validationResult.conflictType
            } with lesson${JSON.stringify(validationResult.conflictWithLesson)}`
        );
    }

    lesson.classroomNumber = newClassroomNumber;
}

function cancelLesson(lessonId: number): void {
    const index = schedule.findIndex((lesson) => lesson.courseId === lessonId);
    if (index === -1) {
        throw new Error(`Lesson with id ${lessonId} was not found`);
    }
    schedule.splice(index, 1);
}

// Simulate the work of the program
const professor1: Professor = {
    id: 1,
    name: 'Dr. Smith',
    department: 'Computer Science',
};
const professor2: Professor = {
    id: 2,
    name: 'Dr. Jones',
    department: 'Mathematics',
};
addProfessor(professor1);
addProfessor(professor2);

try {
    addLesson({
        courseId: 1,
        professorId: 1,
        classroomNumber: '101',
        dayOfWeek: 'Monday',
        timeSlot: '8:30-10:00',
    });
    addLesson({
        courseId: 2,
        professorId: 2,
        classroomNumber: '102',
        dayOfWeek: 'Monday',
        timeSlot: '10:15-11:45',
    });
    addLesson({
        courseId: 1,
        professorId: 1,
        classroomNumber: '101',
        dayOfWeek: 'Tuesday',
        timeSlot: '8:30-10:00',
    });

    // This will throw an error cause of conflict with the same professor at the same time
    addLesson({
        courseId: 2,
        professorId: 1,
        classroomNumber: '101',
        dayOfWeek: 'Monday',
        timeSlot: '8:30-10:00',
    });
} catch (error) {
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error('Unexpected error occurred');
    }
}

// Get professor's schedule
try {
    const smithSchedule = getProfessorSchedule(1);
    console.log(smithSchedule);
} catch (error) {
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error('Unexpected error occurred');
    }
}

// Get available classrooms
const availableClassrooms = findAvailableClassrooms('8:30-10:00', 'Monday');
console.log('Available Classrooms for Monday 8:30-10:00:', availableClassrooms);

// Get classroom utilization
const utilization = getClassroomUtilization('101');
console.log('Utilization of Classroom 101:', `${utilization}%`);

// Get most popular course type
const popularCourseType = getMostPopularCourseType();
console.log('Most Popular Course Type:', popularCourseType);

// Reassign classroom for a lesson
try {
    reassignClassroom(1, '102');
    console.log('Reassigned Classroom for Lesson 1 to 102');
} catch (error) {
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error('Unexpected error occurred');
    }
}

// Cancel a lesson
try {
    cancelLesson(1);
    console.log('Cancelled Lesson 1');
} catch (error) {
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error('Unexpected error occurred');
    }
}

// Output the final state of the schedule
console.log('Final Schedule:', schedule);

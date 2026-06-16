const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const teacherPassword = await bcrypt.hash('guru123', 10);
  const parentPassword = await bcrypt.hash('ortu123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cahayailmu.sch.id' },
    update: {},
    create: {
      email: 'admin@cahayailmu.sch.id',
      password: hashedPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create teacher user and teacher profile
  const teacherUser = await prisma.user.upsert({
    where: { email: 'guru@cahayailmu.sch.id' },
    update: {},
    create: {
      email: 'guru@cahayailmu.sch.id',
      password: teacherPassword,
      name: 'Budi Santoso',
      role: 'TEACHER',
    },
  });

  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      nip: '199001012020121001',
      phone: '081234567890',
      address: 'Jl. Pendidikan No. 1',
      subject: 'Matematika',
      educationLevel: 'SD',
    },
  });
  console.log('Created teacher:', teacherUser.name);

  // Create parent user and parent profile
  const parentUser = await prisma.user.upsert({
    where: { email: 'ortu@cahayailmu.sch.id' },
    update: {},
    create: {
      email: 'ortu@cahayailmu.sch.id',
      password: parentPassword,
      name: 'Ahmad Wijaya',
      role: 'PARENT',
    },
  });

  const parent = await prisma.parent.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: {
      userId: parentUser.id,
      phone: '081234567891',
      address: 'Jl. Keluarga No. 2',
      occupation: 'Wiraswasta',
    },
  });
  console.log('Created parent:', parentUser.name);

  // Create SD classes
  const class1 = await prisma.class.create({
    data: {
      name: 'Kelas 1A',
      gradeLevel: 1,
      educationLevel: 'SD',
      academicYear: '2024/2025',
      homeroomTeacherId: teacher.id,
    },
  });
  console.log('Created class:', class1.name);

  const class2 = await prisma.class.create({
    data: {
      name: 'Kelas 2A',
      gradeLevel: 2,
      educationLevel: 'SD',
      academicYear: '2024/2025',
      homeroomTeacherId: teacher.id,
    },
  });
  console.log('Created class:', class2.name);

  // Create SMP classes
  const class7 = await prisma.class.create({
    data: {
      name: 'Kelas 7A',
      gradeLevel: 7,
      educationLevel: 'SMP',
      academicYear: '2024/2025',
      homeroomTeacherId: teacher.id,
    },
  });
  console.log('Created class:', class7.name);

  const class8 = await prisma.class.create({
    data: {
      name: 'Kelas 8A',
      gradeLevel: 8,
      educationLevel: 'SMP',
      academicYear: '2024/2025',
      homeroomTeacherId: teacher.id,
    },
  });
  console.log('Created class:', class8.name);

  // Create SMA classes
  const class10 = await prisma.class.create({
    data: {
      name: 'Kelas 10A',
      gradeLevel: 10,
      educationLevel: 'SMA',
      academicYear: '2024/2025',
      homeroomTeacherId: teacher.id,
    },
  });
  console.log('Created class:', class10.name);

  const class11 = await prisma.class.create({
    data: {
      name: 'Kelas 11A',
      gradeLevel: 11,
      educationLevel: 'SMA',
      academicYear: '2024/2025',
      homeroomTeacherId: teacher.id,
    },
  });
  console.log('Created class:', class11.name);

  // Create SD subjects
  const sdSubjects = await Promise.all([
    prisma.subject.create({
      data: {
        name: 'Matematika',
        code: 'MTK',
        category: 'GENERAL',
        educationLevel: 'SD',
        description: 'Pelajaran matematika dasar',
        credits: 4,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Bahasa Indonesia',
        code: 'BIN',
        category: 'GENERAL',
        educationLevel: 'SD',
        description: 'Pelajaran bahasa Indonesia',
        credits: 4,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Al-Quran Hadits',
        code: 'AQH',
        category: 'ISLAMIC',
        educationLevel: 'SD',
        description: 'Pelajaran Al-Quran dan Hadits',
        credits: 3,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Tahfidz Quran',
        code: 'THF',
        category: 'QURAN',
        educationLevel: 'SD',
        description: 'Hafalan Al-Quran',
        credits: 2,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Bahasa Arab',
        code: 'BAR',
        category: 'ARABIC',
        educationLevel: 'SD',
        description: 'Pelajaran bahasa Arab',
        credits: 3,
      },
    }),
  ]);
  console.log('Created SD subjects:', sdSubjects.length);

  // Create SMP subjects
  const smpSubjects = await Promise.all([
    prisma.subject.create({
      data: {
        name: 'Matematika SMP',
        code: 'MTK7',
        category: 'GENERAL',
        educationLevel: 'SMP',
        description: 'Pelajaran matematika SMP',
        credits: 4,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Fisika Dasar',
        code: 'FIS',
        category: 'GENERAL',
        educationLevel: 'SMP',
        description: 'Pelajaran fisika dasar',
        credits: 3,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Biologi SMP',
        code: 'BIO',
        category: 'GENERAL',
        educationLevel: 'SMP',
        description: 'Pelajaran biologi SMP',
        credits: 3,
      },
    }),
  ]);
  console.log('Created SMP subjects:', smpSubjects.length);

  // Create SMA subjects
  const smaSubjects = await Promise.all([
    prisma.subject.create({
      data: {
        name: 'Matematika SMA',
        code: 'MTK10',
        category: 'GENERAL',
        educationLevel: 'SMA',
        description: 'Pelajaran matematika SMA',
        credits: 4,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Fisika SMA',
        code: 'FIS10',
        category: 'GENERAL',
        educationLevel: 'SMA',
        description: 'Pelajaran fisika SMA',
        credits: 4,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Kimia SMA',
        code: 'KIM',
        category: 'GENERAL',
        educationLevel: 'SMA',
        description: 'Pelajaran kimia SMA',
        credits: 4,
      },
    }),
  ]);
  console.log('Created SMA subjects:', smaSubjects.length);

  const subjects = [...sdSubjects, ...smpSubjects, ...smaSubjects];

  // Create prayer schedules
  const prayerSchedules = await Promise.all([
    prisma.prayerSchedule.create({
      data: {
        prayerName: 'SUBUH',
        startTime: '04:30',
        endTime: '05:00',
        location: 'Masjid Utama',
        notes: 'Sholat Subuh berjamaah',
        isActive: true,
      },
    }),
    prisma.prayerSchedule.create({
      data: {
        prayerName: 'DHUHA',
        startTime: '08:00',
        endTime: '09:00',
        location: 'Masjid Utama',
        notes: 'Sholat Dhuha berjamaah',
        isActive: true,
      },
    }),
    prisma.prayerSchedule.create({
      data: {
        prayerName: 'ZUHUR',
        startTime: '12:00',
        endTime: '12:30',
        location: 'Masjid Utama',
        notes: 'Sholat Zuhur berjamaah',
        isActive: true,
      },
    }),
    prisma.prayerSchedule.create({
      data: {
        prayerName: 'ASHAR',
        startTime: '15:30',
        endTime: '16:00',
        location: 'Masjid Utama',
        notes: 'Sholat Ashar berjamaah',
        isActive: true,
      },
    }),
    prisma.prayerSchedule.create({
      data: {
        prayerName: 'MAGHRIB',
        startTime: '18:00',
        endTime: '18:30',
        location: 'Masjid Utama',
        notes: 'Sholat Maghrib berjamaah',
        isActive: true,
      },
    }),
    prisma.prayerSchedule.create({
      data: {
        prayerName: 'ISYA',
        startTime: '19:00',
        endTime: '19:30',
        location: 'Masjid Utama',
        notes: 'Sholat Isya berjamaah',
        isActive: true,
      },
    }),
  ]);
  console.log('Created prayer schedules:', prayerSchedules.length);

  // Create religious activities
  const religiousActivities = await Promise.all([
    prisma.religiousActivity.create({
      data: {
        title: 'Jumat Berkah',
        description: 'Program Jumat berkah dengan ceramah dan makan siang bersama',
        activityType: 'JUMAT',
        date: new Date('2024-06-21'),
        location: 'Masjid Utama',
        organizer: 'DKM Masjid',
        isMandatory: true,
        targetAudience: 'ALL',
      },
    }),
    prisma.religiousActivity.create({
      data: {
        title: 'Pengajian Rutin',
        description: 'Pengajian rutin setiap hari Sabtu pagi',
        activityType: 'PENGAJIAN',
        date: new Date('2024-06-22'),
        location: 'Aula Sekolah',
        organizer: 'Bagian Keagamaan',
        isMandatory: false,
        targetAudience: 'STUDENTS',
      },
    }),
    prisma.religiousActivity.create({
      data: {
        title: 'Buka Puasa Bersama',
        description: 'Buka puasa bersama selama bulan Ramadhan',
        activityType: 'RAMADHAN',
        date: new Date('2024-03-15'),
        location: 'Aula Sekolah',
        organizer: 'Panitia Ramadhan',
        isMandatory: true,
        targetAudience: 'ALL',
      },
    }),
  ]);
  console.log('Created religious activities:', religiousActivities.length);

  // Create announcements
  const announcements = await Promise.all([
    prisma.announcement.create({
      data: {
        title: 'Libur Hari Raya Idul Fitri',
        content: 'Diberitahukan bahwa sekolah akan libur selama 3 hari dalam rangka Hari Raya Idul Fitri. Kegiatan belajar mengajar akan dimulai kembali pada tanggal...',
        category: 'RELIGIOUS',
        priority: 'HIGH',
        targetAudience: 'ALL',
        publishDate: new Date('2024-06-15'),
        expiryDate: new Date('2024-06-20'),
        isActive: true,
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'Ujian Semester Ganjil',
        content: 'Ujian semester ganjil akan dilaksanakan mulai tanggal 20 Juni 2024. Mohon siswa mempersiapkan diri dengan baik.',
        category: 'ACADEMIC',
        priority: 'HIGH',
        targetAudience: 'STUDENTS',
        publishDate: new Date('2024-06-10'),
        expiryDate: new Date('2024-06-25'),
        isActive: true,
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'Rapat Orang Tua',
        content: 'Rapat orang tua akan dilaksanakan pada tanggal 25 Juni 2024 pukul 09.00 WIB di Aula Sekolah.',
        category: 'EVENT',
        priority: 'MEDIUM',
        targetAudience: 'PARENTS',
        publishDate: new Date('2024-06-12'),
        expiryDate: new Date('2024-06-25'),
        isActive: true,
      },
    }),
  ]);
  console.log('Created announcements:', announcements.length);

  // Create students
  const student1 = await prisma.student.create({
    data: {
      nis: '2024001',
      nisn: '0012345678',
      name: 'Muhammad Fatih',
      gender: 'MALE',
      birthDate: new Date('2017-05-10'),
      birthPlace: 'Jakarta',
      address: 'Jl. Merdeka No. 1',
      phone: '081234567892',
      parentId: parent.id,
      classId: class1.id,
    },
  });
  console.log('Created student:', student1.name);

  const student2 = await prisma.student.create({
    data: {
      nis: '2024002',
      nisn: '0012345679',
      name: 'Aisyah Putri',
      gender: 'FEMALE',
      birthDate: new Date('2017-08-15'),
      birthPlace: 'Bandung',
      address: 'Jl. Kartini No. 2',
      phone: '081234567893',
      parentId: parent.id,
      classId: class1.id,
    },
  });
  console.log('Created student:', student2.name);

  const student3 = await prisma.student.create({
    data: {
      nis: '2024003',
      nisn: '0012345680',
      name: 'Abdullah Rahman',
      gender: 'MALE',
      birthDate: new Date('2016-03-20'),
      birthPlace: 'Surabaya',
      address: 'Jl. Pahlawan No. 3',
      phone: '081234567894',
      parentId: parent.id,
      classId: class2.id,
    },
  });
  console.log('Created student:', student3.name);

  // Create subject classes
  await Promise.all([
    prisma.subjectClass.create({
      data: {
        classId: class1.id,
        subjectId: subjects[0].id,
        teacherId: teacher.id,
      },
    }),
    prisma.subjectClass.create({
      data: {
        classId: class1.id,
        subjectId: subjects[1].id,
        teacherId: teacher.id,
      },
    }),
    prisma.subjectClass.create({
      data: {
        classId: class1.id,
        subjectId: subjects[2].id,
        teacherId: teacher.id,
      },
    }),
    prisma.subjectClass.create({
      data: {
        classId: class1.id,
        subjectId: subjects[3].id,
        teacherId: teacher.id,
      },
    }),
  ]);
  console.log('Created subject classes');

  // Create grades
  await prisma.grade.create({
    data: {
      studentId: student1.id,
      subjectId: subjects[0].id,
      teacherId: teacher.id,
      semester: 1,
      academicYear: '2024/2025',
      midExam: 85,
      finalExam: 90,
      assignment: 88,
      project: 87,
      participation: 90,
      finalScore: 88,
      grade: 'A',
      remarks: 'Sangat baik',
    },
  });
  console.log('Created grades');

  // Create attendance
  await prisma.attendance.create({
    data: {
      studentId: student1.id,
      teacherId: teacher.id,
      date: new Date('2024-06-10'),
      status: 'PRESENT',
      notes: 'Hadir tepat waktu',
    },
  });
  await prisma.attendance.create({
    data: {
      studentId: student2.id,
      teacherId: teacher.id,
      date: new Date('2024-06-10'),
      status: 'PRESENT',
      notes: 'Hadir tepat waktu',
    },
  });
  await prisma.attendance.create({
    data: {
      studentId: student3.id,
      teacherId: teacher.id,
      date: new Date('2024-06-10'),
      status: 'LATE',
      notes: 'Terlambat 10 menit',
    },
  });
  console.log('Created attendance records');

  // Create tahfidz records
  await prisma.tahfidz.create({
    data: {
      studentId: student1.id,
      surah: 'Al-Fatihah',
      ayatFrom: 1,
      ayatTo: 7,
      juz: 1,
      status: 'COMPLETED',
      date: new Date('2024-06-01'),
      notes: 'Hafalan lancar',
    },
  });
  await prisma.tahfidz.create({
    data: {
      studentId: student1.id,
      surah: 'An-Nas',
      ayatFrom: 1,
      ayatTo: 6,
      juz: 30,
      status: 'IN_PROGRESS',
      date: new Date('2024-06-10'),
      notes: 'Sedang menghafal',
    },
  });
  await prisma.tahfidz.create({
    data: {
      studentId: student2.id,
      surah: 'Al-Fatihah',
      ayatFrom: 1,
      ayatTo: 7,
      juz: 1,
      status: 'COMPLETED',
      date: new Date('2024-06-05'),
      notes: 'Hafalan lancar',
    },
  });
  console.log('Created tahfidz records');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

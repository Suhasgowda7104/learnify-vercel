import sinon from 'sinon';

let sandbox = null;

beforeEach(() => {
  sandbox = sinon.createSandbox();
});

afterEach(() => {
  sandbox.restore();
}); 

const { getAllCourses, getCourseById } = await import('../../src/controllers/student.controller.js');
const CourseService = (await import('../../src/services/course.service.js')).default;

describe('Student Controller', () => {
  let req, res;

  describe('getAllCourses', () => {
    beforeEach(() => {
      req = {
        params: {},
        body: {},
        user: {}
      };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis()
      };
    });
    it('should return all active courses successfully', async () => {
      // Arrange
      const mockCourses = [
        {
          id: 1,
          title: 'JavaScript Fundamentals',
          description: 'Learn JavaScript basics',
          price: 99.99,
          status: 'active'
        },
        {
          id: 2,
          title: 'React Development',
          description: 'Build React applications',
          price: 149.99,
          status: 'active'
        }
      ];
      sandbox.stub(CourseService, 'getAllActiveCourses').resolves(mockCourses);

      // Act
      await getAllCourses(req, res);

      // Assert
      sinon.assert.calledOnce(CourseService.getAllActiveCourses);
      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.json, mockCourses);
    });

    it('should handle errors when fetching courses fails', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      sandbox.stub(CourseService, 'getAllActiveCourses').rejects(new Error(errorMessage));
      const consoleSpy = sandbox.stub(console, 'error');

      // Act
      await getAllCourses(req, res);

      // Assert
      sinon.assert.calledOnce(CourseService.getAllActiveCourses);
      sinon.assert.calledWith(consoleSpy, 'Error fetching courses:', sinon.match.instanceOf(Error));
      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.json, { message: 'Failed to fetch courses' });
    });

    it('should return empty array when no courses exist', async () => {
      // Arrange
      sandbox.stub(CourseService, 'getAllActiveCourses').resolves([]);

      // Act
      await getAllCourses(req, res);

      // Assert
      sinon.assert.calledOnce(CourseService.getAllActiveCourses);
      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.json, []);
    });
  });

  describe('getCourseById', () => {
    beforeEach(() => {
      req = {
        params: {},
        body: {},
        user: {}
      };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis()
      };
    });

    it('should return course when valid ID is provided', async () => {
      // Arrange
      const courseId = '1';
      const mockCourse = {
        id: 1,
        title: 'JavaScript Fundamentals',
        description: 'Learn JavaScript basics',
        price: 99.99,
        status: 'active',
        instructor: 'John Doe'
      };
      req.params.id = courseId;
      sandbox.stub(CourseService, 'getCourseById').resolves(mockCourse);

      // Act
      await getCourseById(req, res);

      // Assert
      sinon.assert.calledWith(CourseService.getCourseById, courseId);
      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.json, mockCourse);
    });

    it('should return 404 when course is not found', async () => {
      // Arrange
      const courseId = '999';
      req.params.id = courseId;
      sandbox.stub(CourseService, 'getCourseById').resolves(null);

      // Act
      await getCourseById(req, res);

      // Assert
      sinon.assert.calledWith(CourseService.getCourseById, courseId);
      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledWith(res.json, { message: 'Course not found' });
    });

    it('should handle errors when fetching course fails', async () => {
      // Arrange
      const courseId = '1';
      const errorMessage = 'Database query failed';
      req.params.id = courseId;
      sandbox.stub(CourseService, 'getCourseById').rejects(new Error(errorMessage));
      const consoleSpy = sandbox.stub(console, 'error');

      // Act
      await getCourseById(req, res);

      // Assert
      sinon.assert.calledWith(CourseService.getCourseById, courseId);
      sinon.assert.calledWith(consoleSpy, 'Error fetching course:', sinon.match.instanceOf(Error));
      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.json, { message: 'Failed to fetch course' });
    });

    it('should handle invalid course ID format', async () => {
      // Arrange
      const invalidCourseId = 'invalid-id';
      req.params.id = invalidCourseId;
      sandbox.stub(CourseService, 'getCourseById').rejects(new Error('Invalid ID format'));
      const consoleSpy = sandbox.stub(console, 'error');

      // Act
      await getCourseById(req, res);

      // Assert
      sinon.assert.calledWith(CourseService.getCourseById, invalidCourseId);
      sinon.assert.calledWith(consoleSpy, 'Error fetching course:', sinon.match.instanceOf(Error));
      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.json, { message: 'Failed to fetch course' });
    });

    it('should handle undefined course ID', async () => {
      // Arrange
      req.params = {}; // No id parameter
      sandbox.stub(CourseService, 'getCourseById').resolves(null);

      // Act
      await getCourseById(req, res);

      // Assert
      sinon.assert.calledWith(CourseService.getCourseById, undefined);
      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledWith(res.json, { message: 'Course not found' });
    });
  });
});
import { jest } from '@jest/globals';
import sinon from 'sinon';

// Mock express-validator before importing the controller
const mockValidationResult = jest.fn();

// Use doMock for better ES module support
jest.doMock('express-validator', () => ({
  validationResult: mockValidationResult
}));

// Import after mocking
const { default: AdminController } = await import('../../src/controllers/admin.controller.js');
const { default: AdminService } = await import('../../src/services/admin.service.js');

let sandbox;

describe('AdminController', () => {
  let req, res;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      params: {}
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    // Reset Jest mocks
    mockValidationResult.mockReset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('createCourse', () => {
    const mockCourseData = {
      title: 'Test Course',
      description: 'Test Description',
      price: 99.99,
      durationHours: 10,
      isActive: true,
      courseContent: []
    };

    it('should create a course successfully', async () => {
      // Arrange
      const mockCourse = { id: 1, ...mockCourseData };
      mockValidationResult.mockReturnValue({ isEmpty: () => true });
      sandbox.stub(AdminService, 'createCourse').resolves(mockCourse);
      req.body = mockCourseData;

      // Act
      await AdminController.createCourse(req, res);

      // Assert
      sinon.assert.calledWith(AdminService.createCourse, mockCourseData);
      sinon.assert.calledWith(res.status, 201);
      sinon.assert.calledWith(res.json, {
        success: true,
        message: 'Course created successfully',
        data: mockCourse
      });
    });

    it('should return validation errors when validation fails', async () => {
      // Arrange
      const mockErrors = [{ field: 'title', message: 'Title is required' }];
      const validationResultStub = {
        isEmpty: () => false,
        array: () => mockErrors
      };
      mockValidationResult.mockReturnValue(validationResultStub);
      sandbox.stub(AdminService, 'createCourse');

      // Act
      await AdminController.createCourse(req, res);

      // Assert
      sinon.assert.notCalled(AdminService.createCourse);
      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledWith(res.json, {
        success: false,
        message: 'Validation failed',
        errors: mockErrors
      });
    });

    it('should handle service errors', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      mockValidationResult.mockReturnValue({ isEmpty: () => true });
      sandbox.stub(AdminService, 'createCourse').rejects(new Error(errorMessage));
      const consoleSpy = sandbox.stub(console, 'error');

      // Act
      await AdminController.createCourse(req, res);

      // Assert
      sinon.assert.calledWith(consoleSpy, 'Create course error:', sinon.match.instanceOf(Error));
      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.json, {
        success: false,
        message: errorMessage
      });
    });

    it('should handle unknown errors', async () => {
      // Arrange
      mockValidationResult.mockReturnValue({ isEmpty: () => true });
      sandbox.stub(AdminService, 'createCourse').rejects(new Error());
      const consoleSpy = sandbox.stub(console, 'error');

      // Act
      await AdminController.createCourse(req, res);

      // Assert
      sinon.assert.calledWith(consoleSpy, 'Create course error:', sinon.match.instanceOf(Error));
      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.json, {
        success: false,
        message: 'Failed to create course'
      });
    });

    it('should set default isActive to true when not provided', async () => {
      // Arrange
      const courseDataWithoutIsActive = {
        title: 'Test Course',
        description: 'Test Description',
        price: 99.99,
        durationHours: 10,
        courseContent: []
      };
      req.body = courseDataWithoutIsActive;
      const expectedCourseData = { ...courseDataWithoutIsActive, isActive: true };
      mockValidationResult.mockReturnValue({ isEmpty: () => true });
      sandbox.stub(AdminService, 'createCourse').resolves({ id: 1, ...expectedCourseData });

      // Act
      await AdminController.createCourse(req, res);

      // Assert
      sinon.assert.calledWith(AdminService.createCourse, expectedCourseData);
      sinon.assert.calledWith(res.status, 201);
    });
  });

  describe('updateCourse', () => {
    const mockUpdateData = {
      title: 'Updated Course',
      description: 'Updated Description',
      price: 149.99,
      durationHours: 15,
      isActive: false
    };

    beforeEach(() => {
      req.params.id = '1';
      req.body = mockUpdateData;
    });

    it('should update a course successfully', async () => {
      // Arrange
      const mockUpdatedCourse = { id: 1, ...mockUpdateData };
      const expectedUpdateData = { ...mockUpdateData, courseContent: [] };
      mockValidationResult.mockReturnValue({ isEmpty: () => true });
      sandbox.stub(AdminService, 'updateCourse').resolves(mockUpdatedCourse);

      // Act
      await AdminController.updateCourse(req, res);

      // Assert
      sinon.assert.calledWith(AdminService.updateCourse, '1', expectedUpdateData);
      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.json, {
        success: true,
        message: 'Course updated successfully',
        data: mockUpdatedCourse
      });
    });

    it('should return validation errors when validation fails', async () => {
      // Arrange
      const mockErrors = [{ field: 'price', message: 'Price must be a number' }];
      const validationResultStub = {
        isEmpty: () => false,
        array: () => mockErrors
      };
      mockValidationResult.mockReturnValue(validationResultStub);
      sandbox.stub(AdminService, 'updateCourse');

      // Act
      await AdminController.updateCourse(req, res);

      // Assert
      sinon.assert.notCalled(AdminService.updateCourse);
      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledWith(res.json, {
        success: false,
        message: 'Validation failed',
        errors: mockErrors
      });
    });

    it('should handle course not found error', async () => {
      // Arrange
      mockValidationResult.mockReturnValue({ isEmpty: () => true });
      sandbox.stub(AdminService, 'updateCourse').rejects(new Error('Course not found'));
      const consoleSpy = sandbox.stub(console, 'error');

      // Act
      await AdminController.updateCourse(req, res);

      // Assert
      sinon.assert.calledWith(consoleSpy, 'Update course error:', sinon.match.instanceOf(Error));
      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledWith(res.json, {
        success: false,
        message: 'Course not found'
      });
    });

    it('should handle other service errors', async () => {
      // Arrange
      const errorMessage = 'Database update failed';
      mockValidationResult.mockReturnValue({ isEmpty: () => true });
      sandbox.stub(AdminService, 'updateCourse').rejects(new Error(errorMessage));
      const consoleSpy = sandbox.stub(console, 'error');

      // Act
      await AdminController.updateCourse(req, res);

      // Assert
      sinon.assert.calledWith(consoleSpy, 'Update course error:', sinon.match.instanceOf(Error));
      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.json, {
        success: false,
        message: errorMessage
      });
    });
  });

  describe('deleteCourse', () => {
    beforeEach(() => {
      req.params.id = '1';
    });

    it('should delete a course successfully', async () => {
      // Arrange
      const mockResult = {
        success: true,
        message: 'Course deleted successfully',
        course: { id: 1, title: 'Deleted Course' }
      };
      sandbox.stub(AdminService, 'deleteCourse').resolves(mockResult);

      // Act
      await AdminController.deleteCourse(req, res);

      // Assert
      sinon.assert.calledWith(AdminService.deleteCourse, '1');
      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.json, {
        success: true,
        message: 'Course deleted successfully',
        data: { id: 1, title: 'Deleted Course' }
      });
    });

    it('should handle course not found error', async () => {
      // Arrange
      sandbox.stub(AdminService, 'deleteCourse').rejects(new Error('Course not found'));
      const consoleSpy = sandbox.stub(console, 'error');

      // Act
      await AdminController.deleteCourse(req, res);

      // Assert
      sinon.assert.calledWith(consoleSpy, 'Delete course error:', sinon.match.instanceOf(Error));
      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledWith(res.json, {
        success: false,
        message: 'Course not found'
      });
    });

    it('should handle other service errors', async () => {
      // Arrange
      const errorMessage = 'Database deletion failed';
      sandbox.stub(AdminService, 'deleteCourse').rejects(new Error(errorMessage));
      const consoleSpy = sandbox.stub(console, 'error');

      // Act
      await AdminController.deleteCourse(req, res);

      // Assert
      sinon.assert.calledWith(consoleSpy, 'Delete course error:', sinon.match.instanceOf(Error));
      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.json, {
        success: false,
        message: errorMessage
      });
    });

    it('should handle result without course data', async () => {
      // Arrange
      const mockResult = {
        success: true,
        message: 'Course deleted successfully'
      };
      sandbox.stub(AdminService, 'deleteCourse').resolves(mockResult);

      // Act
      await AdminController.deleteCourse(req, res);

      // Assert
      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.json, {
        success: true,
        message: 'Course deleted successfully',
        data: null
      });
    });
  });
});
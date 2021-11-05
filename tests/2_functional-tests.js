const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let project = 'apitest';
let issue_id;

suite('Functional Tests', function() {
  test('Create an issue with every field', function(done) {
    chai.request(server)
      .post(`/api/issues/${project}`)
      .send({
        issue_title: 'issue_title',
        issue_text: 'issue_text',
        created_by: 'created_by',
        assigned_to: 'assigned_to',
        open: true,
        status_text: 'status_text'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'issue_title');
        assert.equal(res.body.issue_text, 'issue_text');
        assert.equal(res.body.created_by, 'created_by');
        assert.equal(res.body.assigned_to, 'assigned_to');
        assert.equal(res.body.open, true);
        assert.equal(res.body.status_text, 'status_text');
        issue_id=res.body._id;
        done();
      });
  });

  test('Create an issue with only required fields', function(done) {
    chai.request(server)
      .post(`/api/issues/${project}`)
      .send({
        issue_title: 'issue_title',
        issue_text: 'issue_text',
        created_by: 'created_by',
        open: true
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'issue_title');
        assert.equal(res.body.issue_text, 'issue_text');
        assert.equal(res.body.created_by, 'created_by');
        assert.equal(res.body.open, true);
        done();
      });
  });

  test('Create an issue with missing required fields', function(done) {
    chai.request(server)
      .post(`/api/issues/${project}`)
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  test('View issues on a project', function(done) {
    chai.request(server)
      .get(`/api/issues/${project}`)
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test('View issues on a project with one filter', function(done) {
    chai.request(server)
      .get(`/api/issues/${project}`)
      .query({created_by: 'created_by'})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.equal(res.body.length,res.body.filter(e=>e.created_by==='created_by').length);
        done();
      });
  });

  test('View issues on a project with multiple filters', function(done) {
    chai.request(server)
      .get(`/api/issues/${project}`)
      .query({created_by: 'created_by',
              issue_title: 'issue_title'})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.equal(res.body.length,res.body.filter(e=>e.created_by==='created_by').filter(e=>e.issue_title==='issue_title').length);
        done();
      });
  });

  test('Update one field on an issue', function(done) {
    chai.request(server)
      .put(`/api/issues/${project}`)
      .send({_id:issue_id,
            created_by: 'hameed'})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body._id, issue_id);
        assert.equal(res.body.result, 'successfully updated');
        done();
      });
  });

  test('Update multiple fields on an issue', function(done) {
    chai.request(server)
      .put(`/api/issues/${project}`)
      .send({_id:issue_id,
            created_by: 'hameed',
            issue_title: 'issue'})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body._id, issue_id);
        assert.equal(res.body.result, 'successfully updated');
        done();
      });
  });

  test('Update an issue with missing _id', function(done) {
    chai.request(server)
      .put(`/api/issues/${project}`)
      .send({created_by: 'hameed',
            issue_title: 'issue'})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('Update an issue with no fields to update', function(done) {
    chai.request(server)
      .put(`/api/issues/${project}`)
      .send({_id:issue_id})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body._id, issue_id);
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  test('Update an issue with an invalid _id', function(done) {
    chai.request(server)
      .put(`/api/issues/${project}`)
      .send({_id:'ThisIsAnInvalid_id',
            created_by: 'hameed',
            issue_title: 'issue'})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body._id, 'ThisIsAnInvalid_id');
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  test('Update an issue with an invalid _id', function(done) {
    chai.request(server)
      .put(`/api/issues/${project}`)
      .send({_id:'ThisIsAnInvalid_id',
            created_by: 'hameed',
            issue_title: 'issue'})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body._id, 'ThisIsAnInvalid_id');
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  test('Delete an issue', function(done) {
    chai.request(server)
      .delete(`/api/issues/${project}`)
      .send({_id:issue_id})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body._id, issue_id);
        assert.equal(res.body.result, 'successfully deleted');
        done();
      });
  });

  test('Delete an issue with an invalid _id', function(done) {
    chai.request(server)
      .delete(`/api/issues/${project}`)
      .send({_id:issue_id})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body._id, issue_id);
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });

  test('Delete an issue with missing _id', function(done) {
    chai.request(server)
      .delete(`/api/issues/${project}`)
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

});

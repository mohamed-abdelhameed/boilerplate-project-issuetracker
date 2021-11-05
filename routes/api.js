'use strict';

const mongoose = require('mongoose');

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

const { Schema } = mongoose;

const projectSchema = new Schema({
  name: { type: String, required: true },
  issues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }]
});

const Project = mongoose.model('Project', projectSchema);

const issueSchema = new Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_on: { type: Date },
  updated_on: { type: Date },
  created_by: { type: String, required: true },
  assigned_to: { type: String },
  open: { type: Boolean, required: true },
  status_text: { type: String }
});

const Issue = mongoose.model('Issue', issueSchema);


module.exports = function(app) {

  app.route('/api/issues/:project')

    .get(function(req, res) {
      let project = req.params.project;
      Project.findOne({ name: project }).populate('issues').exec((err, prj) => {
        let result = prj.issues;

        if (req.query.issue_title) {
          result = result.filter(e => e.issue_title === req.query.issue_title);
        }
        if (req.query.issue_text) {
          result = result.filter(e => e.issue_text === req.query.issue_text);
        }
        if (req.query.created_by) {
          result = result.filter(e => e.created_by === req.query.created_by);
        }
        if (req.query.assigned_to) {
          result = result.filter(e => e.assigned_to === req.query.assigned_to);
        }
        if (req.query.status_text) {
          result = result.filter(e => e.status_text === req.query.status_text);
        }
        if (req.query.created_on) {
          result = result.filter(e => e.created_on === req.query.created_on);
        }
        if (req.query.updated_on) {
          result = result.filter(e => e.updated_on == req.query.updated_on);
        }
        if (req.query.updated_by) {
          result = result.filter(e => e.updated_by === req.query.updated_by);
        }
        if (req.query._id) {
          result = result.filter(e => e._id == req.query._id);
        }
        if (req.query.open) {
          result = result.filter(e => e.open === req.query.open);
        }
        res.json(result);
      });
    })

    .post(function(req, res) {
      let project = req.params.project;
      let issue = {};

      let issue_title = req.body.issue_title;
      if (issue_title) issue['issue_title'] = issue_title;
      else res.json({ error: 'required field(s) missing' });

      let issue_text = req.body.issue_text;
      if (issue_text) issue['issue_text'] = issue_text;
      else res.json({ error: 'required field(s) missing' });

      let created_by = req.body.created_by;
      if (created_by) issue['created_by'] = created_by;
      else res.json({ error: 'required field(s) missing' });
      // Optional
      let assigned_to = req.body.assigned_to;
      issue['assigned_to'] = assigned_to || "";

      let status_text = req.body.status_text;
      issue['status_text'] = status_text || "";

      issue['created_on'] = new Date();
      issue['updated_on'] = new Date();
      issue['updated_by'] = created_by;
      issue['open'] = true;
      Project.findOne({ name: project }, (err, data) => {
        if (data) {
          let issueObj = new Issue(issue);
          issueObj.save((err, iss) => {
            data.issues.push(iss);
            data.save((err, prj) => { });
            res.json(iss);
          });
        } else {
          let projectObj = new Project({ name: project });
          projectObj.save((err, data) => {
            let issueObj = new Issue(issue);
            issueObj.save((err, iss) => {
              data.issues.push(iss);
              data.save((err, prj) => { });
              res.json(iss);
            });
          });
        }
      });
    })

    .put(function(req, res) {
      let project = req.params.project;
      if (!req.body._id) {
        res.json({ error: 'missing _id' });
        return;
      }
      let issue = {};

      let issue_title = req.body.issue_title;
      if (issue_title) issue['issue_title'] = issue_title;

      let issue_text = req.body.issue_text;
      if (issue_text) issue['issue_text'] = issue_text;

      let created_by = req.body.created_by;
      if (created_by) issue['created_by'] = created_by;
      // Optional
      let assigned_to = req.body.assigned_to;
      if (assigned_to) issue['assigned_to'] = assigned_to;

      let status_text = req.body.status_text;
      if (status_text) issue['status_text'] = status_text;

      let created_on = req.body.created_on;
      if (created_on) issue['created_on'] = new Date(created_on);

      let updated_by = req.body.updated_by;
      if (updated_by) issue['updated_by'] = updated_by;

      let open = req.body.open;
      if (open) issue['open'] = open;

      if (Object.keys(issue).length===0) {
        res.json({ error: 'no update field(s) sent', '_id': req.body._id });
        return;
      }

      issue['updated_on'] = new Date();
      // console.log('put',req.body._id,issue);
      Issue.findByIdAndUpdate(
        req.body._id,
        issue,
        { new: true , useFindAndModify: false }
        , (err, iss) => {
          if (err||!iss) {res.json({ error: 'could not update', '_id': req.body._id });
          return;} 
          res.json({result:'successfully updated','_id':req.body._id});
        });
    })

    .delete(function(req, res) {
      let project = req.params.project;
      if (!req.body._id) {
        res.json({ error: 'missing _id' });
        return;
      }
      Issue.findByIdAndDelete(req.body._id,
      { $filter: { issues: req.body._id } },
      (err,iss)=>{
        if(err||!iss) {
          res.json({ error: 'could not delete', '_id': req.body._id });
          return;
        }
        res.json({ result: 'successfully deleted', '_id': req.body._id });
      });
    });

};

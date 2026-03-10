import React from 'react';

function ProfilePage({ user }) {
  if (!user) {
    return <div className="alert alert-warning">You are not logged in.</div>;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">User details</h5>
            <dl className="row mb-0">
              <dt className="col-sm-4">Name</dt>
              <dd className="col-sm-8">
                {user.fname} {user.lname}
              </dd>
              <dt className="col-sm-4">Email</dt>
              <dd className="col-sm-8">{user.email}</dd>
              <dt className="col-sm-4">Role</dt>
              <dd className="col-sm-8">{user.role}</dd>
              <dt className="col-sm-4">Phone</dt>
              <dd className="col-sm-8">{user.phone || '-'}</dd>
              <dt className="col-sm-4">Country</dt>
              <dd className="col-sm-8">{user.country || '-'}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;


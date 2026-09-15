import { auth, db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { setDocument, getDocument, addDocument } from '../services/firebaseDb';
import api from './axios';

const ts = () => serverTimestamp();

// Helper to get current authenticated user uid
const getCurrentUid = () => {
  return auth.currentUser?.uid || JSON.parse(localStorage.getItem('sb_user') || '{}')?.id || JSON.parse(localStorage.getItem('sb_user') || '{}')?.uid;
};

// ── Auth with direct Firestore / REST fallback ────────────────────────────────
export const login = async () => {
  try {
    const uid = getCurrentUid();
    if (!uid) {
      return { data: { success: false, message: 'No user session' } };
    }

    const userDoc = await getDocument('users', uid);
    if (!userDoc || !userDoc.role) {
      return {
        data: {
          success: true,
          action: 'ONBOARDING_REQUIRED',
          user: {
            uid,
            id: uid,
            email: auth.currentUser?.email || '',
            needsOnboarding: true,
          }
        }
      };
    }

    return {
      data: {
        success: true,
        action: 'LOGIN_SUCCESS',
        user: {
          uid,
          id: uid,
          ...userDoc,
        }
      }
    };
  } catch (err) {
    console.warn('Firestore direct login fallback error:', err);
    try {
      return await api.post('/auth/login');
    } catch {
      throw err;
    }
  }
};

export const getMe = async () => {
  const uid = getCurrentUid();
  if (!uid) return { data: { success: false, data: null } };
  const userDoc = await getDocument('users', uid);
  return { data: { success: true, data: userDoc } };
};

export const refreshCheck = async () => {
  return { data: { success: true } };
};

// ── Role-specific registration endpoints ─────────────────────────────────────
export const registerStudent = async (data) => {
  const uid = getCurrentUid();
  if (uid) {
    await setDocument('students', uid, { ...data, uid, id: uid });
    await setDocument('users', uid, {
      ...data,
      role: 'student',
      onboardingCompleted: true,
      verified: false,
      verificationStatus: 'pending',
    });
  }
  return { data: { success: true, message: 'Student registered successfully' } };
};

export const registerCollege = async (data) => {
  const uid = getCurrentUid();
  if (uid) {
    await setDocument('colleges', uid, { ...data, uid, id: uid });
    await setDocument('users', uid, {
      ...data,
      role: 'college',
      onboardingCompleted: true,
      verified: false,
      verificationStatus: 'pending_admin',
    });
  }
  return { data: { success: true, message: 'College registered successfully' } };
};

export const registerCompany = async (data) => {
  const uid = getCurrentUid();
  if (uid) {
    await setDocument('industries', uid, { ...data, uid, id: uid });
    await setDocument('users', uid, {
      ...data,
      role: 'industry',
      onboardingCompleted: true,
      verified: false,
      verificationStatus: 'pending_admin',
    });
  }
  return { data: { success: true, message: 'Company registered successfully' } };
};

// ── Verification Endpoints ───────────────────────────────────────────────────

// GET /api/verification/status
export const getVerificationStatus = async () => {
  try {
    const uid = getCurrentUid();
    if (!uid) return { data: { success: false, data: null } };
    const userDoc = await getDocument('users', uid);
    return {
      data: {
        success: true,
        data: {
          verified: userDoc?.verified || false,
          verificationStatus: userDoc?.verificationStatus || 'pending',
          role: userDoc?.role || 'student',
        }
      }
    };
  } catch (err) {
    console.error('getVerificationStatus error:', err);
    return { data: { success: false, data: { verified: false, verificationStatus: 'pending' } } };
  }
};

// GET /api/verification/pending — Admin: all pending requests
export const getPendingVerifications = async () => {
  try {
    const q = query(collection(db, 'verificationRequests'), where('status', '==', 'pending'));
    const snap = await getDocs(q);
    const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    results.sort((a, b) => {
      const timeA = a.createdAt?.seconds || (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0);
      const timeB = b.createdAt?.seconds || (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0);
      return timeB - timeA;
    });

    return { data: { success: true, data: results } };
  } catch (err) {
    console.warn('Firestore getPendingVerifications error, trying REST:', err.message);
    try {
      return await api.get('/verification/pending');
    } catch {
      return { data: { success: true, data: [] } };
    }
  }
};

// POST /api/verification/approve/:requestId — Admin approves college/company
export const approveVerification = async (requestId, notes = '') => {
  try {
    const reqRef = doc(db, 'verificationRequests', requestId);
    const reqSnap = await getDoc(reqRef);
    if (!reqSnap.exists()) {
      return { data: { success: false, message: 'Request not found.' } };
    }

    const reqData = reqSnap.data();
    const uid = reqData.applicantUid || reqData.studentUid;
    const type = reqData.type;

    // 1. Mark request approved
    await updateDoc(reqRef, {
      status: 'approved',
      reviewedAt: ts(),
      notes: notes || 'Approved by Admin',
    });

    // 2. Update user doc
    if (uid) {
      await setDocument('users', uid, {
        verified: true,
        verificationStatus: 'approved',
      });

      // 3. Update profile doc (colleges or industries)
      const profileCollection = type === 'college_to_admin' ? 'colleges' : 'industries';
      await setDocument(profileCollection, uid, {
        verified: true,
        verificationStatus: 'approved',
      });

      // 4. Send notification
      const entityName = reqData.institutionName || reqData.companyName || 'Your organization';
      await addDocument('notifications', {
        userId: uid,
        title: '✅ Registration Approved!',
        message: `${entityName} has been approved by the EduNex admin. You now have full access to the platform.`,
        type: 'verification',
        referenceId: requestId,
        referenceType: 'admin_approval',
        read: false,
      });
    }

    return { data: { success: true, message: 'Request approved successfully.' } };
  } catch (err) {
    console.error('approveVerification error:', err);
    try {
      return await api.post(`/verification/approve/${requestId}`, { notes });
    } catch {
      throw err;
    }
  }
};

// POST /api/verification/reject/:requestId — Admin rejects
export const rejectVerification = async (requestId, reason = '') => {
  try {
    const reqRef = doc(db, 'verificationRequests', requestId);
    const reqSnap = await getDoc(reqRef);
    if (!reqSnap.exists()) {
      return { data: { success: false, message: 'Request not found.' } };
    }

    const reqData = reqSnap.data();
    const uid = reqData.applicantUid || reqData.studentUid;

    // 1. Mark request rejected
    await updateDoc(reqRef, {
      status: 'rejected',
      reviewedAt: ts(),
      reason: reason || 'Rejected by Admin',
    });

    // 2. Update user doc
    if (uid) {
      await setDocument('users', uid, {
        verified: false,
        verificationStatus: 'rejected',
      });

      // 3. Send notification
      const entityName = reqData.institutionName || reqData.companyName || reqData.studentName || 'Your account';
      await addDocument('notifications', {
        userId: uid,
        title: '❌ Registration Rejected',
        message: `${entityName} registration was rejected by EduNex admin. ${reason ? 'Reason: ' + reason : 'Please contact support for more details.'}`,
        type: 'verification',
        read: false,
      });
    }

    return { data: { success: true, message: 'Request rejected.' } };
  } catch (err) {
    console.error('rejectVerification error:', err);
    try {
      return await api.post(`/verification/reject/${requestId}`, { reason });
    } catch {
      throw err;
    }
  }
};

// GET /api/verification/college-students — College: pending student requests
export const getCollegeStudentRequests = async () => {
  try {
    const collegeUid = getCurrentUid();
    const collegeDoc = await getDocument('colleges', collegeUid);
    const collegeName = collegeDoc?.name;

    let q;
    if (collegeName) {
      q = query(
        collection(db, 'verificationRequests'),
        where('type', '==', 'student_to_college'),
        where('college', '==', collegeName),
        where('status', '==', 'pending')
      );
    } else {
      q = query(
        collection(db, 'verificationRequests'),
        where('type', '==', 'student_to_college'),
        where('status', '==', 'pending')
      );
    }

    const snap = await getDocs(q);
    const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    results.sort((a, b) => {
      const timeA = a.createdAt?.seconds || (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0);
      const timeB = b.createdAt?.seconds || (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0);
      return timeB - timeA;
    });

    return { data: { success: true, data: results } };
  } catch (err) {
    console.warn('Firestore getCollegeStudentRequests error:', err.message);
    try {
      return await api.get('/verification/college-students');
    } catch {
      return { data: { success: true, data: [] } };
    }
  }
};

// POST /api/verification/approve-student/:studentId — College approves/rejects student
export const approveStudent = async (studentId, action, reason = '') => {
  try {
    const isApproved = action === 'approve';
    const newStatus = isApproved ? 'approved' : 'rejected';
    const collegeUid = getCurrentUid();
    const collegeDoc = await getDocument('colleges', collegeUid);
    const collegeName = collegeDoc?.name || 'Your college';

    // 1. Update students collection
    await setDocument('students', studentId, {
      verified: isApproved,
      verificationStatus: newStatus,
    });

    // 2. Update users collection
    await setDocument('users', studentId, {
      verified: isApproved,
      verificationStatus: newStatus,
    });

    // 3. Update verification request
    const q = query(
      collection(db, 'verificationRequests'),
      where('studentUid', '==', studentId),
      where('status', '==', 'pending')
    );
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await updateDoc(doc(db, 'verificationRequests', d.id), {
        status: newStatus,
        reviewedAt: ts(),
        reviewedBy: collegeUid,
      });
    }

    // 4. Notify student
    await addDocument('notifications', {
      userId: studentId,
      title: isApproved ? '✅ Account Verified!' : '❌ Verification Rejected',
      message: isApproved
        ? `Your account has been verified by ${collegeName}. You now have full access to EduNex!`
        : `Your verification was rejected by ${collegeName}. ${reason ? 'Reason: ' + reason : ''}`,
      type: 'verification',
      read: false,
    });

    return { data: { success: true, message: `Student ${newStatus} successfully.` } };
  } catch (err) {
    console.error('approveStudent error:', err);
    try {
      return await api.post(`/verification/approve-student/${studentId}`, { action, reason });
    } catch {
      throw err;
    }
  }
};

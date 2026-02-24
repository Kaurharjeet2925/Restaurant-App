const ActivityLog = require('../models/activityLog.model');

/**
 * Log an activity for auditing and tracking
 * @param {Object} params - Activity log details
 * @param {string} params.module - Module name (e.g., 'notification')
 * @param {string} params.action - Action performed (e.g., 'CREATED', 'READ')
 * @param {string} params.description - Description of the activity
 * @param {Object} params.user - User object or userId
 * @param {string} [params.referenceId] - Reference document ID
 * @param {Object} [params.meta] - Additional metadata
 */
async function logActivity({ module, action, description, user, referenceId = null, meta = {} }) {
	try {
		let performedBy = {};
		if (user) {
			if (user._id) performedBy.userId = user._id;
			performedBy.name = user.name || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Unknown');
			performedBy.role = user.role || 'Unknown';
		}
		await ActivityLog.create({
			module,
			action,
			description,
			performedBy,
			referenceId,
			meta,
		});
	} catch (err) {
		console.error('[logActivity] Failed to log activity:', err);
	}
}

module.exports = logActivity;

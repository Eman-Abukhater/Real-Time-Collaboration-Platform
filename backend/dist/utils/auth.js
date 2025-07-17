"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
function requireRole(user, roles) {
    if (!user)
        throw new Error("Authentication required");
    if (!roles.includes(user.role)) {
        throw new Error(`Access denied for role: ${user.role}`);
    }
}

import { vi } from "vitest";
import type { IUserRepository } from "../../../repository/user";

export const createMockUserRepository = (): IUserRepository => {
	return {
		fetchRolesByUserId: vi.fn(),
		createUser: vi.fn(),
		createTemporaryUser: vi.fn(),
		fetchUserProfileById: vi.fn(),
		fetchAllUsers: vi.fn(),
		fetchApprovedUsers: vi.fn(),
		fetchMembers: vi.fn(),
		fetchMemberByDisplayId: vi.fn(),
		registerUser: vi.fn(),
		updateUser: vi.fn(),
		updateUserRole: vi.fn(),
		addUserRole: vi.fn(),
		fetchProvisionalUsers: vi.fn(),
		approveProvisionalUser: vi.fn(),
		confirmPayment: vi.fn(),
		rejectProvisionalUser: vi.fn(),
		updateLastLoginAt: vi.fn(),
		fetchPublicMemberByDisplayId: vi.fn(),
	};
};

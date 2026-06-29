package com.fatec.labify.api.service;

import com.fatec.labify.domain.Branch;
import com.fatec.labify.domain.Laboratory;
import com.fatec.labify.domain.Role;
import com.fatec.labify.domain.User;
import com.fatec.labify.exception.ForbiddenOperationException;
import org.springframework.stereotype.Service;

@Service
public class AccessControlService {

    public boolean isSystemUser(User user) {
        return user.getRole() == Role.SYSTEM;
    }

    public boolean isLabSuperAdmin(User user, Laboratory lab) {
        return lab.getSuperAdmin() != null && lab.getSuperAdmin().getId().equals(user.getId());
    }

    public boolean isBranchAdmin(User user, Branch branch) {
        return branch.getAdmin() != null && branch.getAdmin().getId().equals(user.getId());
    }

    public boolean canManageLab(User user, Laboratory lab) {
        return isSystemUser(user) || isLabSuperAdmin(user, lab);
    }

    public boolean canManageBranch(User user, Branch branch) {
        return isSystemUser(user) ||
                isLabSuperAdmin(user, branch.getLaboratory()) ||
                isBranchAdmin(user, branch);
    }

    public void validateSystemUser(User user) {
        if (!isSystemUser(user)) {
            throw new ForbiddenOperationException();
        }
    }

    public void validateCanManageLab(User user, Laboratory lab) {
        if (!canManageLab(user, lab)) {
            throw new ForbiddenOperationException();
        }
    }

    public void validateCanManageBranch(User user, Branch branch) {
        if (!canManageBranch(user, branch)) {
            throw new ForbiddenOperationException();
        }
    }

}

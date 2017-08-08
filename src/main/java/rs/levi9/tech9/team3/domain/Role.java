package rs.levi9.tech9.team3.domain;

import java.util.List;
import java.util.Set;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.ManyToMany;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "role")
public class Role extends BaseEntity  {

	@Enumerated(EnumType.STRING)
	private RoleType type;
	
	@JsonBackReference
	@ManyToMany(mappedBy="roles")
	private List<User> users;

	public RoleType getType() {
		return type;
	}

	public void setType(RoleType type) {
		this.type = type;
	}

	public List<User> getUsers() {
		return users;
	}

	public void setUsers(List<User> users) {
		this.users = users;
	}

	public Role() {
		// TODO Auto-generated constructor stub
	}

	public enum RoleType {
		ROLE_USER, ROLE_ADMIN;

	}
}
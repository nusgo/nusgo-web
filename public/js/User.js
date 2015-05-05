function User() {
    this.name = "";
    this.id = "";
    this.photo = null;
}

User.prototype.updateWithDictionary = function(dictionary) {
    this.name = dictionary["name"];
    this.id = dictionary["id"];
};

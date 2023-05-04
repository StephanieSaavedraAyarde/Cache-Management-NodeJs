Create schema `Twitter`;
CREATE TABLE `Twitter`.`follow` (
  `id_follow` INT NOT NULL AUTO_INCREMENT,
  `user_a` INT NOT NULL,
  `user_b` INT NOT NULL,
  PRIMARY KEY (`id_follow`),
  FOREIGN KEY (`user_a`) REFERENCES `Twitter`.`user` (`id_user`),
  FOREIGN KEY (`user_b`) REFERENCES `Twitter`.`user` (`id_user`));
  
CREATE TABLE `Twitter`.`tweet` (
  `id_tweet` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `tweet_text` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`id_tweet`),
  FOREIGN KEY (`user_id`) REFERENCES `Twitter`.`user` (`id_user`));

CREATE TABLE `Twitter`.`user` (
  `id_user` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_user`));
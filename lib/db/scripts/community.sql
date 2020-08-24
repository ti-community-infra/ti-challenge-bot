-- MySQL dump 10.13  Distrib 5.7.29, for osx10.15 (x86_64)
--
-- Host: *    Database: community
-- ------------------------------------------------------
-- Server version	5.7.29

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary table structure for view `active_contributor_week_pr`
--

DROP TABLE IF EXISTS `active_contributor_week_pr`;
/*!50001 DROP VIEW IF EXISTS `active_contributor_week_pr`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `active_contributor_week_pr` AS SELECT
 1 AS `year_week`,
 1 AS `PRs`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `active_contributors`
--

DROP TABLE IF EXISTS `active_contributors`;
/*!50001 DROP VIEW IF EXISTS `active_contributors`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `active_contributors` AS SELECT
 1 AS `user`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `best_contributor_in_recent_year`
--

DROP TABLE IF EXISTS `best_contributor_in_recent_year`;
/*!50001 DROP VIEW IF EXISTS `best_contributor_in_recent_year`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `best_contributor_in_recent_year` AS SELECT
 1 AS `user`,
 1 AS `num`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner` varchar(255) DEFAULT NULL,
  `repo` varchar(255) DEFAULT NULL,
  `comment_id` int(11) DEFAULT NULL,
  `comment_type` varchar(128) DEFAULT NULL,
  `pull_number` int(11) DEFAULT NULL,
  `body` text,
  `user` varchar(255) DEFAULT NULL,
  `url` varchar(1023) DEFAULT NULL,
  `association` varchar(255) DEFAULT NULL,
  `relation` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_comments_pull_number` (`pull_number`)
) ENGINE=InnoDB AUTO_INCREMENT=587023 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `community_oncall`
--

DROP TABLE IF EXISTS `community_oncall`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `community_oncall` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contributor_info_id` int(11) DEFAULT NULL,
  `last_oncall` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `count` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `contributor_info_id` (`contributor_info_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contributor_info`
--

DROP TABLE IF EXISTS `contributor_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contributor_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `github` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `tel` varchar(25) DEFAULT NULL,
  `other` varchar(255) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `tp` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `github` (`github`)
) ENGINE=InnoDB AUTO_INCREMENT=3816 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `contributor_medium_hard_pr_rank30`
--

DROP TABLE IF EXISTS `contributor_medium_hard_pr_rank30`;
/*!50001 DROP VIEW IF EXISTS `contributor_medium_hard_pr_rank30`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `contributor_medium_hard_pr_rank30` AS SELECT
 1 AS `user`,
 1 AS `count(*)`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `contributor_pr_rank30`
--

DROP TABLE IF EXISTS `contributor_pr_rank30`;
/*!50001 DROP VIEW IF EXISTS `contributor_pr_rank30`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `contributor_pr_rank30` AS SELECT
 1 AS `user`,
 1 AS `count(*)`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `contributor_review_rank30`
--

DROP TABLE IF EXISTS `contributor_review_rank30`;
/*!50001 DROP VIEW IF EXISTS `contributor_review_rank30`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `contributor_review_rank30` AS SELECT
 1 AS `user`,
 1 AS `count(distinct(pull_number))`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `contributor_trace`
--

DROP TABLE IF EXISTS `contributor_trace`;
/*!50001 DROP VIEW IF EXISTS `contributor_trace`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `contributor_trace` AS SELECT
 1 AS `sig`,
 1 AS `user`,
 1 AS `PRs`,
 1 AS `first`,
 1 AS `last`,
 1 AS `location`,
 1 AS `contact`,
 1 AS `comment`,
 1 AS `recent_state`,
 1 AS `updated_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `contributors`
--

DROP TABLE IF EXISTS `contributors`;
/*!50001 DROP VIEW IF EXISTS `contributors`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `contributors` AS SELECT
 1 AS `user`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `exec_contribution_rank`
--

DROP TABLE IF EXISTS `exec_contribution_rank`;
/*!50001 DROP VIEW IF EXISTS `exec_contribution_rank`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `exec_contribution_rank` AS SELECT
 1 AS `user`,
 1 AS `count(*)`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `exec_contribution_two_weeks_rank`
--

DROP TABLE IF EXISTS `exec_contribution_two_weeks_rank`;
/*!50001 DROP VIEW IF EXISTS `exec_contribution_two_weeks_rank`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `exec_contribution_two_weeks_rank` AS SELECT
 1 AS `user`,
 1 AS `count(*)`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `exec_new_contributor_this_week`
--

DROP TABLE IF EXISTS `exec_new_contributor_this_week`;
/*!50001 DROP VIEW IF EXISTS `exec_new_contributor_this_week`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `exec_new_contributor_this_week` AS SELECT
 1 AS `user`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `exec_new_contributor_two_weeks`
--

DROP TABLE IF EXISTS `exec_new_contributor_two_weeks`;
/*!50001 DROP VIEW IF EXISTS `exec_new_contributor_two_weeks`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `exec_new_contributor_two_weeks` AS SELECT
 1 AS `user`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `exec_new_prs_this_week`
--

DROP TABLE IF EXISTS `exec_new_prs_this_week`;
/*!50001 DROP VIEW IF EXISTS `exec_new_prs_this_week`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `exec_new_prs_this_week` AS SELECT
 1 AS `count(*)`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `github_label_sig`
--

DROP TABLE IF EXISTS `github_label_sig`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `github_label_sig` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `repo` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `info` varchar(255) DEFAULT NULL,
  `project_sig_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `repo` (`repo`,`label`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `incubator_comments`
--

DROP TABLE IF EXISTS `incubator_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `incubator_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner` varchar(255) DEFAULT NULL,
  `repo` varchar(255) DEFAULT NULL,
  `comment_id` int(11) DEFAULT NULL,
  `comment_type` varchar(128) DEFAULT NULL,
  `pull_number` int(11) DEFAULT NULL,
  `body` text,
  `user` varchar(255) DEFAULT NULL,
  `url` varchar(1023) DEFAULT NULL,
  `association` varchar(255) DEFAULT NULL,
  `relation` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_comments_pull_number` (`pull_number`)
) ENGINE=InnoDB AUTO_INCREMENT=447927 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `incubator_pulls`
--

DROP TABLE IF EXISTS `incubator_pulls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `incubator_pulls` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner` varchar(255) DEFAULT NULL,
  `repo` varchar(255) DEFAULT NULL,
  `pull_number` int(11) DEFAULT NULL,
  `title` text,
  `body` text,
  `user` varchar(255) DEFAULT NULL,
  `association` varchar(255) DEFAULT NULL,
  `relation` varchar(255) DEFAULT NULL,
  `label` text,
  `status` varchar(128) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `merged_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_pull_number` (`pull_number`)
) ENGINE=InnoDB AUTO_INCREMENT=1606 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `issues`
--

DROP TABLE IF EXISTS `issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `issues` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner` varchar(255) DEFAULT NULL,
  `repo` varchar(255) DEFAULT NULL,
  `issue_number` int(11) DEFAULT NULL,
  `title` text,
  `body` text,
  `user` varchar(255) DEFAULT NULL,
  `association` varchar(255) DEFAULT NULL,
  `relation` varchar(255) DEFAULT NULL,
  `label` text,
  `status` varchar(128) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_issue_number` (`issue_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `picks`
--

DROP TABLE IF EXISTS `picks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `picks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `season` int(11) DEFAULT NULL,
  `owner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `repo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `task_id` int(11) DEFAULT '0',
  `teamID` int(11) DEFAULT NULL,
  `user` varchar(255) DEFAULT NULL,
  `pull_number` int(11) DEFAULT '0',
  `score` int(11) NOT NULL,
  `status` varchar(128) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4525 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project_sig`
--

DROP TABLE IF EXISTS `project_sig`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_sig` (
  `sig_id` int(11) DEFAULT NULL,
  `repo` varchar(255) DEFAULT NULL,
  `project_url` varchar(255) DEFAULT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `project_sig_id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`project_sig_id`),
  UNIQUE KEY `project_url` (`project_url`),
  UNIQUE KEY `sig_id` (`sig_id`,`repo`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pulls`
--

DROP TABLE IF EXISTS `pulls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pulls` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner` varchar(255) DEFAULT NULL,
  `repo` varchar(255) DEFAULT NULL,
  `pull_number` int(11) DEFAULT NULL,
  `title` text,
  `body` text,
  `user` varchar(255) DEFAULT NULL,
  `association` varchar(255) DEFAULT NULL,
  `relation` varchar(255) DEFAULT NULL,
  `label` text,
  `status` varchar(128) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `merged_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_pull_number` (`pull_number`)
) ENGINE=InnoDB AUTO_INCREMENT=59710 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reviewers`
--

DROP TABLE IF EXISTS `reviewers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviewers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `github_id` varchar(255) DEFAULT NULL,
  `organization` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `slack_id` varchar(255) DEFAULT NULL,
  `group_name` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=765 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sig`
--

DROP TABLE IF EXISTS `sig`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sig` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `info` varchar(255) DEFAULT NULL,
  `sig_url` varchar(255) DEFAULT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `channel` varchar(255) DEFAULT NULL,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` int(11) NOT NULL DEFAULT '0',
  `lgtm` int(11) DEFAULT '2',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=1003 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sig_member`
--

DROP TABLE IF EXISTS `sig_member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sig_member` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sig_id` int(11) DEFAULT NULL,
  `contributor_id` int(11) DEFAULT NULL,
  `level` varchar(255) DEFAULT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `sig_id` (`sig_id`,`contributor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=782 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sig_members`
--

DROP TABLE IF EXISTS `sig_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sig_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sig` varchar(128) DEFAULT NULL,
  `user` varchar(128) DEFAULT NULL,
  `location` varchar(128) DEFAULT '',
  `contact` varchar(128) DEFAULT '',
  `comment` text CHARACTER SET utf8,
  `recent_state` text CHARACTER SET utf8,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `role` varchar(128) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sig` (`sig`,`user`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sig_pr_status`
--

DROP TABLE IF EXISTS `sig_pr_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sig_pr_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sig_id` int(11) DEFAULT NULL,
  `merged` int(11) DEFAULT NULL,
  `closed` int(11) DEFAULT NULL,
  `open` int(11) DEFAULT NULL,
  `create_date` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sig_time` (`sig_id`,`create_date`)
) ENGINE=InnoDB AUTO_INCREMENT=141 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sig_slack_activity`
--

DROP TABLE IF EXISTS `sig_slack_activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sig_slack_activity` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sig_id` int(11) DEFAULT NULL,
  `members` int(11) DEFAULT NULL,
  `messages` int(11) DEFAULT NULL,
  `members_who_posted` int(11) DEFAULT NULL,
  `member_who_reviewed` int(11) DEFAULT NULL,
  `create_date` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sig_time` (`sig_id`,`create_date`)
) ENGINE=InnoDB AUTO_INCREMENT=124 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `slack_recent_2_week`
--

DROP TABLE IF EXISTS `slack_recent_2_week`;
/*!50001 DROP VIEW IF EXISTS `slack_recent_2_week`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `slack_recent_2_week` AS SELECT
 1 AS `create_date`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `taskgroups`
--

DROP TABLE IF EXISTS `taskgroups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taskgroups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `season` int(11) DEFAULT NULL,
  `owner` varchar(255) DEFAULT NULL,
  `repo` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `issue_number` int(11) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `bonus` int(11) DEFAULT '0',
  `vote` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `season` int(11) DEFAULT NULL,
  `complete_user` varchar(255) DEFAULT NULL,
  `complete_team` int(11) DEFAULT NULL,
  `owner` varchar(255) DEFAULT NULL,
  `repo` varchar(255) DEFAULT NULL,
  `title` varchar(2047) DEFAULT NULL,
  `issue_number` int(11) NOT NULL DEFAULT '0',
  `pull_number` int(11) DEFAULT NULL,
  `level` varchar(255) DEFAULT NULL,
  `min_score` int(11) DEFAULT '0',
  `score` int(11) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expired` varchar(255) DEFAULT NULL,
  `taskgroup_id` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4805 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `season` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `issue_url` varchar(1023) DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3211 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `tikv_org_contributor`
--

DROP TABLE IF EXISTS `tikv_org_contributor`;
/*!50001 DROP VIEW IF EXISTS `tikv_org_contributor`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `tikv_org_contributor` AS SELECT
 1 AS `user`,
 1 AS `cnt`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `tikv_org_review_outside`
--

DROP TABLE IF EXISTS `tikv_org_review_outside`;
/*!50001 DROP VIEW IF EXISTS `tikv_org_review_outside`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `tikv_org_review_outside` AS SELECT
 1 AS `user`,
 1 AS `cnt`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `tikv_repo_contributor`
--

DROP TABLE IF EXISTS `tikv_repo_contributor`;
/*!50001 DROP VIEW IF EXISTS `tikv_repo_contributor`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `tikv_repo_contributor` AS SELECT
 1 AS `user`,
 1 AS `cnt`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `tikv_review_community_7d_rank`
--

DROP TABLE IF EXISTS `tikv_review_community_7d_rank`;
/*!50001 DROP VIEW IF EXISTS `tikv_review_community_7d_rank`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `tikv_review_community_7d_rank` AS SELECT
 1 AS `user`,
 1 AS `cnt`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `season` int(11) DEFAULT NULL,
  `user` varchar(255) DEFAULT NULL,
  `email` varchar(1023) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `team_id` int(11) DEFAULT NULL,
  `issue_url` varchar(1023) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `leader` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3271 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `views`
--

DROP TABLE IF EXISTS `views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `views` (
  `viewname` varchar(100) DEFAULT NULL,
  `displayname` varchar(200) DEFAULT NULL,
  `description` text,
  `visible` tinyint(1) DEFAULT NULL,
  UNIQUE KEY `viewname` (`viewname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `active_contributor_week_pr`
--

/*!50001 DROP VIEW IF EXISTS `active_contributor_week_pr`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `active_contributor_week_pr` AS select (concat(year(`pulls`.`merged_at`),'-1-1') + interval ((week(`pulls`.`merged_at`,0) - 1) * 7) day) AS `year_week`,count(0) AS `PRs` from `pulls` where (`pulls`.`user` in (select `active_contributors`.`user` from `active_contributors`) and (`pulls`.`status` = 'merged')) group by year(`pulls`.`merged_at`),week(`pulls`.`merged_at`,0) order by year(`pulls`.`merged_at`),week(`pulls`.`merged_at`,0) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `active_contributors`
--

/*!50001 DROP VIEW IF EXISTS `active_contributors`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `active_contributors` AS select `pulls`.`user` AS `user` from `pulls` where ((`pulls`.`relation` like '%not member%') and (`pulls`.`status` = 'merged') and ('merged_at' >= (now() - interval 365 day))) group by `pulls`.`user` having (count(0) >= 8) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `best_contributor_in_recent_year`
--

/*!50001 DROP VIEW IF EXISTS `best_contributor_in_recent_year`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `best_contributor_in_recent_year` AS select `a`.`user` AS `user`,`a`.`num` AS `num` from (select `community`.`pulls`.`user` AS `user`,count(0) AS `num` from `community`.`pulls` where ((`community`.`pulls`.`status` = 'merged') and (`community`.`pulls`.`merged_at` >= (now() + interval -(1) year))) group by `community`.`pulls`.`user`) `a` where (not(`a`.`user` in (select `community`.`contributor_info`.`github` from `community`.`contributor_info` where (`community`.`contributor_info`.`company` like '%pingcap%')))) order by `a`.`num` desc limit 10 */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `contributor_medium_hard_pr_rank30`
--

/*!50001 DROP VIEW IF EXISTS `contributor_medium_hard_pr_rank30`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `contributor_medium_hard_pr_rank30` AS select `users`.`user` AS `user`,count(0) AS `count(*)` from ((`tasks` join `picks`) join `users`) where (((`tasks`.`level` = 'medium') or (`tasks`.`level` = 'hard')) and (`tasks`.`id` = `picks`.`task_id`) and (`picks`.`teamID` = `users`.`team_id`)) group by `users`.`user` order by count(0) desc limit 30 */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `contributor_pr_rank30`
--

/*!50001 DROP VIEW IF EXISTS `contributor_pr_rank30`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `contributor_pr_rank30` AS select `pulls`.`user` AS `user`,count(0) AS `count(*)` from `pulls` where ((`pulls`.`relation` = 'not member') and (`pulls`.`status` = 'merged')) group by `pulls`.`user` order by count(0) desc limit 30 */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `contributor_review_rank30`
--

/*!50001 DROP VIEW IF EXISTS `contributor_review_rank30`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `contributor_review_rank30` AS select `comments`.`user` AS `user`,count(distinct `comments`.`pull_number`) AS `count(distinct(pull_number))` from `comments` where (`comments`.`user` in (select `active_contributors`.`user` from `active_contributors`) and (`comments`.`relation` = 'not member') and (`comments`.`comment_type` in ('review','review comment'))) group by `comments`.`user` order by count(distinct `comments`.`pull_number`) desc limit 30 */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `contributor_trace`
--

/*!50001 DROP VIEW IF EXISTS `contributor_trace`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `contributor_trace` AS select `sm`.`sig` AS `sig`,`prs`.`user` AS `user`,`prs`.`PRs` AS `PRs`,`prs`.`first` AS `first`,`prs`.`last` AS `last`,`sm`.`location` AS `location`,`sm`.`contact` AS `contact`,`sm`.`comment` AS `comment`,`sm`.`recent_state` AS `recent_state`,`sm`.`updated_at` AS `updated_at` from ((select `community`.`pulls`.`user` AS `user`,count(0) AS `PRs`,min(`community`.`pulls`.`merged_at`) AS `first`,max(`community`.`pulls`.`merged_at`) AS `last` from `community`.`pulls` where ((`community`.`pulls`.`status` = 'merged') and `community`.`pulls`.`user` in (select distinct `community`.`sig_members`.`user` from `community`.`sig_members`)) group by `community`.`pulls`.`user`) `prs` join `community`.`sig_members` `sm`) where (convert(`sm`.`user` using utf8mb4) = `prs`.`user`) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `contributors`
--

/*!50001 DROP VIEW IF EXISTS `contributors`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `contributors` AS select distinct `pulls`.`user` AS `user` from `pulls` where (`pulls`.`label` like '%contribution%') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `exec_contribution_rank`
--

/*!50001 DROP VIEW IF EXISTS `exec_contribution_rank`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `exec_contribution_rank` AS select `pulls`.`user` AS `user`,count(0) AS `count(*)` from `pulls` where ((`pulls`.`status` = 'merged') and ((`pulls`.`label` like '%expression%') or (`pulls`.`label` like '%executor%')) and (`pulls`.`label` like '%contribution%')) group by `pulls`.`user` order by count(0) desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `exec_contribution_two_weeks_rank`
--

/*!50001 DROP VIEW IF EXISTS `exec_contribution_two_weeks_rank`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `exec_contribution_two_weeks_rank` AS select `pulls`.`user` AS `user`,count(0) AS `count(*)` from `pulls` where ((`pulls`.`status` = 'merged') and ((`pulls`.`label` like '%expression%') or (`pulls`.`label` like '%executor%')) and (`pulls`.`merged_at` >= (curdate() - interval 2 week)) and (`pulls`.`label` like '%contribution%')) group by `pulls`.`user` order by count(0) desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `exec_new_contributor_this_week`
--

/*!50001 DROP VIEW IF EXISTS `exec_new_contributor_this_week`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `exec_new_contributor_this_week` AS select distinct `pulls`.`user` AS `user` from `pulls` where ((`pulls`.`status` = 'merged') and ((`pulls`.`label` like '%execution%') or (`pulls`.`label` like '%expression%')) and (`pulls`.`label` like '%contribution%') and (not(`pulls`.`user` in (select distinct `pulls`.`user` from `pulls` where ((`pulls`.`status` = 'merged') and ((`pulls`.`label` like '%expression%') or (`pulls`.`label` like '%executor%')) and (`pulls`.`label` like '%contribution%') and (`pulls`.`merged_at` < (curdate() - interval 1 week))))))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `exec_new_contributor_two_weeks`
--

/*!50001 DROP VIEW IF EXISTS `exec_new_contributor_two_weeks`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `exec_new_contributor_two_weeks` AS select distinct `pulls`.`user` AS `user` from `pulls` where ((`pulls`.`status` = 'merged') and (`pulls`.`label` like '%expression%') and (`pulls`.`label` like '%contribution%') and (not(`pulls`.`user` in (select distinct `pulls`.`user` from `pulls` where ((`pulls`.`status` = 'merged') and ((`pulls`.`label` like '%expression%') or (`pulls`.`label` like '%executor%')) and (`pulls`.`label` like '%contribution%') and (`pulls`.`merged_at` < (curdate() - interval 2 week))))))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `exec_new_prs_this_week`
--

/*!50001 DROP VIEW IF EXISTS `exec_new_prs_this_week`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `exec_new_prs_this_week` AS select count(0) AS `count(*)` from `pulls` where ((`pulls`.`status` = 'merged') and ((`pulls`.`label` like '%execution%') or (`pulls`.`label` like '%expression%')) and (`pulls`.`label` like '%contribution%') and (`pulls`.`merged_at` > (curdate() - interval 1 week))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `slack_recent_2_week`
--

/*!50001 DROP VIEW IF EXISTS `slack_recent_2_week`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `slack_recent_2_week` AS select distinct `sig_slack_activity`.`create_date` AS `create_date` from `sig_slack_activity` order by `sig_slack_activity`.`create_date` desc limit 2 */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `tikv_org_contributor`
--

/*!50001 DROP VIEW IF EXISTS `tikv_org_contributor`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `tikv_org_contributor` AS select `pulls`.`user` AS `user`,count(1) AS `cnt` from `pulls` where ((`pulls`.`owner` = 'tikv') and (`pulls`.`relation` = 'not member')) group by `pulls`.`user` order by `cnt` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `tikv_org_review_outside`
--

/*!50001 DROP VIEW IF EXISTS `tikv_org_review_outside`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `tikv_org_review_outside` AS select `s`.`user` AS `user`,count(1) AS `cnt` from (((select `community`.`comments`.`user` AS `user`,`community`.`comments`.`owner` AS `owner`,`community`.`comments`.`repo` AS `repo`,`community`.`comments`.`pull_number` AS `pull_number`,count(1) AS `cnt` from `community`.`comments` where ((`community`.`comments`.`owner` = 'tikv') and (`community`.`comments`.`relation` = 'not member')) group by `community`.`comments`.`user`,`community`.`comments`.`pull_number`)) `s` join `community`.`pulls` on(((`community`.`pulls`.`owner` = `s`.`owner`) and (`community`.`pulls`.`repo` = `s`.`repo`) and (`community`.`pulls`.`pull_number` = `s`.`pull_number`)))) where (`community`.`pulls`.`user` <> `s`.`user`) group by `s`.`user` order by `cnt` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `tikv_repo_contributor`
--

/*!50001 DROP VIEW IF EXISTS `tikv_repo_contributor`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `tikv_repo_contributor` AS select `pulls`.`user` AS `user`,count(1) AS `cnt` from `pulls` where ((`pulls`.`owner` = 'tikv') and (`pulls`.`repo` = 'tikv') and (`pulls`.`relation` = 'not member')) group by `pulls`.`user` order by `cnt` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `tikv_review_community_7d_rank`
--

/*!50001 DROP VIEW IF EXISTS `tikv_review_community_7d_rank`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `tikv_review_community_7d_rank` AS select `comments`.`user` AS `user`,count(1) AS `cnt` from `comments` where ((`comments`.`owner` = 'tikv') and (`comments`.`user` <> 'sre-bot') and (`comments`.`repo` = 'tikv') and (`comments`.`relation` = 'member') and (`comments`.`created_at` > (now() - interval 7 day)) and `comments`.`pull_number` in (select `pulls`.`pull_number` from `pulls` where ((`pulls`.`owner` = 'tikv') and (`pulls`.`repo` = 'tikv') and (`pulls`.`relation` = 'not member')))) group by `comments`.`user` order by `cnt` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-08-20 17:57:04

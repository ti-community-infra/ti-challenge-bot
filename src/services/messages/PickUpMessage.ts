export class PickUpMessage {
    public static NotChallengeProgramIssue = 'This issue not a challenge program issue!';
    public static PickUpSuccess = 'Pickup success.'
    public static NoSigInfo = 'Can not find any sig info on this issue, please contact the issue author to add sig info label.'
    public static IllegalSigInfo = 'This issue have a wrong sig info, please contact the issue author to add a correct sig info label.'
    public static IllegalIssueFormat = 'This issue have a wrong format description, please contact the issue author to modify the issue description.'
    public static failed (reason: string): string {
      return `Pickup failed, because ${reason}`
    }
}

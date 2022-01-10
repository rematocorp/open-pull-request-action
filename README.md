# Open pull request action


The action tries to open PR and then checks if the PR is mergeable. If mergeable then action returns PR id, if not then process exits with error code 1 to prevent later execution.
Now maximum time to wait for PR state is 3 sec.

```yaml
name: Open pull request and echo its number
jobs:
  example:
    runs-on: ubuntu-latest
    steps:
      - name: Open PR
        id: open_pr
        uses: rematocorp/open-pull-request-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          from-branch: change_this
          to-branch: change_this
          repository-owner: change_this
          repository: change_this
          
      - name: Echo mergeable PR number
        run: echo ${{ steps.open_pr.outputs.pull_number }}
    
```

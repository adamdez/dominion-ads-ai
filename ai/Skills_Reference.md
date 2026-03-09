# Skills Reference

These are the core AI/system skills the Dominion Home Deals operator system should eventually support.

## 1. Google Ads Data Fetcher
Purpose:
Pull Google Ads performance data into the system.

Inputs:
- campaigns
- ad groups
- keywords
- search terms
- clicks
- cost
- conversions
- conversion value

Outputs:
- normalized ads data stored in Supabase
- sync status
- error logging

## 2. Search Term Analyzer
Purpose:
Analyze incoming search term data to identify waste and opportunity.

Inputs:
- search terms
- clicks
- cost
- conversions
- campaign
- ad group
- market

Outputs:
- negative keyword suggestions
- opportunity keyword clusters
- waste term flags
- seller intent labels

## 3. Lead Quality Scorer
Purpose:
Estimate how likely a lead is to become a real deal.

Inputs:
- form fields
- call transcript
- seller timeline
- condition notes
- market
- source
- downstream deal outcomes

Outputs:
- lead score
- motivation score
- urgency score
- likely deal probability

## 4. Campaign Recommendation Engine
Purpose:
Turn performance data into operational suggestions.

Inputs:
- ads performance
- lead quality data
- search terms
- landing page data
- market segmentation

Outputs:
- recommendation type
- reason
- expected impact
- risk level
- approval required

## 5. Seller Situation Classifier
Purpose:
Classify leads and search terms by wholesaling-specific situation.

Possible labels:
- inherited
- probate
- tired landlord
- tenant issues
- major repairs
- divorce
- foreclosure
- relocation
- vacant property
- low-intent / exploring

Inputs:
- form text
- call transcript
- search term
- landing page
- notes

Outputs:
- situation label
- confidence score
- urgency hint
- follow-up priority

## 6. Domain / Landing Attribution Analyzer
Purpose:
Compare how domains and landing pages perform by market and outcome.

Inputs:
- domain
- landing page
- keyword cluster
- campaign
- market
- source
- downstream lead quality

Outputs:
- best-performing page/domain combinations
- redirect recommendations
- landing page test opportunities
- trust vs conversion insights
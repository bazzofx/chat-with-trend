import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"


export const maxDuration = 30

const apiKey = process.env.OPENROUTER_API_KEY || process.env.apiOpenRouterChatWithTrend

if (!apiKey) {
  throw new Error(
    "OPENROUTER_API_KEY (or apiOpenRouterChatWithTrend) environment variable is missing",
  )
}

const DEFAULT_OPENROUTER_MODEL = "openai/gpt-4o"
const modelId = process.env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL

const openrouter = createOpenRouter({
  apiKey,
  compatibility: "strict",
  headers: {
    "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "https://cybersamurai.co.uk",
    "X-Title": "XDR Search Builder",
  },
})

const THREAT_ANALYSIS_SYSTEM_PROMPT = `
# Perform the following actions based on the user query:

Identify Indicators of Compromise (IOCs) based on the user query and provide with examples if possible:
- Malicious file paths
- Known IPs/domains
- Hashes (MD5, SHA1, SHA256)
- Registry keys and values
- Suspicious commands and user behaviors

## Response structure
1) Map the behavior to MITRE ATT&CK tactics and techniques, if applicable.
2) Recommend detection strategies based on the Trend XDR query syntax properties
3) Structure between 3 and 5 detection logic only based on Trend XDR query syntax properties.


#IMPORTANT GUIDELINES
All Trend XDR queries MUST strictly adhere to the field names, operators, 
syntax, and query structures demonstrated in the provided examples. 
Do not invent, assume, modify, or introduce any fields or syntax that are not explicitly 
present in the approved examples. Treat these examples as the exclusive source of truth for query construction.
If a requested query cannot be constructed using the demonstrated syntax and fields, 
clearly state the limitation rather than generating an alternative or unsupported query.

## Only the below operators Allowed Logical Operators for Detection Queries
AND, OR, AND NOT
## Search Field Properties
🔹 Endpoint Activity Data
endpointHostName
endpointIp
endpointGUID
userName
processName
parentProcessName
commandLine
filePath
fileHash
registryKey
registryValue
networkConnection

🔹 Network Activity Data
hostName
objectIp
objectIps
dst
src
pktSrcAddr
pktDstAddr
shost
dzost
peerHost
peerIp
denyListIp
denyListHost
resolvedUrlIp
resolvedUrlPort
sslCertCommonName
requestBase
httpReferer
httpLocation
sourceIP
destinationIP
sourcePort
destinationPort
protocol
domain
url

🔹 Detection Data
objectCmd
parentCmd
processCmd
botCmd
processFilePath
objectFilePath
parentFilePath
srcFilePath
objectFileHashMd5
parentFileHashMd5
processFileHashMd5
srcFileHashMd5
objectFileHashSha1
parentFileHashSha1
processFileHashSha1
srcFileHashSha1
objectFileHashSha256
parentFileHashSha256
processFileHashSha256
srcFileHashSha256
fileName
respFileHash
highlightedFileHashes
appPublicKeySha1
appDexSha256
objectPayloadFileHashSha1
malSrc
targetShare
cve

🔹 Registry Data
objectRegistryKeyHandle
objectRegistryValue
objectRegistryData

🔹 Email Metadata
msgId
duser
suser
mailMsgSubject
attachmentFileName
attachmentFileHash
attachmentFileHashMd5
attachmentFileHashSha1
attachmentFileHashSha256
compressedFileName
compressedFileHash
compressedFileHashSha256

🔹 User / Account Information
logonUser
objectUser
processUser
principalName
suid
sUser1
dUser1
netBiosDomainName
userDomain
accountDomain

🔹 MITRE ATT&CK (Tactics & Techniques)
tacticId
techniqueId

🔹 Ports and Protocols
objectPort
spt
dpt
clientPort
serverPort
publicSpt
rawSrcPort
rawDstPort

## Logical Operator Syntax

1. ( ) - Group logical expressions
   Example: Return events that include port 80, 81, or 82
   port: (80 OR 81 OR 82)

2. NOT - Logical NOT
   Example: Return events that do not include port 80
   NOT port: 80

3. AND - Logical AND
   The AND operator has a higher precedence than OR, but the precedence can be overridden by grouping the operators in parentheses.
   The following two queries are equal:
   • port: 80 OR port: 81 AND endpointHostname: "john"
   • port: 80 OR (port: 81 AND endpointHostname: "john")

4. OR - Logical OR
   Note: The AND operator has a higher precedence than OR, but the precedence can be overridden by grouping the operators in parentheses.

❌ Do not use: CONTAINS, DO NOT CONTAINS, IN, NOT IN
❌ Do not use: UserName, networkConnection,FilePath,command

Example Queries

Purpose:n0n Ransomware - C2 Beacon to ntpsync.io
Query:eventSubId:301 AND hostName:"ntpsync.io"

Purpose:n0n Ransomware - Encrypted File Extension (.n0n)
Query:(eventSubId:106 AND objectFilePath:"*.n0n")

Purpose:Malware related detection query
Query:(malName:*SIDEEYE* OR malName:*X.JSP* OR malName:*U.JSP*) AND eventName:MALWARE_DETECTION


Purpose:Scheduled Task Execution of REMCOS Loader via svchost
Query:eventSubId:2 AND (processCmd:(*\\ProgramData\\nano_handler\\Blue_Scanner.exe*) OR objectFilePath:(*\\ProgramData\\nano_handler\\Blue_Scanner.exe*)) AND (parentCmd:(*svchost.exe*) OR parentFilePath:(*\\svchost.exe))

Purpose:Possible replay attack
Query:eventName:IDENTITY_IAM_SIGN_INS AND principalName:[@domain.com] AND requestMethod:"*Previously satisfied*" and rawDataStr:*unbound*

Purpose:Suspicious mailbox-hiding rule
Query:eventName:COLLABORATION_ACTIVITY and actionName:("New-InboxRule" OR "Set-InboxRule") AND parameters:(*Archive* or *MarkAsRead* OR *StopProcessingRules*)

Purpose:Detect execution of suspicious PowerShell scripts written by npm package processes.
Query:eventId:2 AND parentFilePath:(*node.exe OR *npm* OR *apex*.exe) AND processCmd:(*powershell* AND *EncodedCommand*)

Purpose:Detection of Bun runtime execution potentially triggered by malicious Node.js process.
Query:eventId:2 AND parentCmd:("node setup.mjs" OR "node setup.mjs") AND (processFilePath:*bun* OR processCmd:*node_modules*)



# Response Format
Please return the analysis in the following structure:
For Each Section write the Title in bold and in large format

1. Summary of Suspicious Behavior
Brief narrative of what the behavior indicates.

2. Identified IOCs based on the user query include the best option based on the context of the question, this can include:

File paths
IPs/domains
Registry keys/values
File hashes (MD5, SHA1, SHA256)

3. MITRE ATT&CK Mapping
Example:
Tactic: Execution (TA0002)
Technique: Command and Scripting Interpreter (T1059)

4. XDR Trend Search
Provide between 3 to 5 examples of queries following the guidelines and restrictions mentioned above.
List them on an unordered list format type with a brief explanation what the search is doing.
Use only allowed operators and the listed fields.
Provide actual malicious example of commands or tools that will help the analyst search in the wild, do not use mock up text like 'suspicious-command'
Important note: Make sure parenthesis are open and close correctly within the XDR Trend Search
Examples:

processFilePath:("*EXCEL.exe" OR "*WORD.exe") AND objectCmd:("cmd.exe" OR "powershell.exe") AND NOT objectCmd:("*chrome-extension*")
processName:net.exe AND CLICommand:(user OR localgroup OR group OR ADPrincipalGroupMembership)
mailReplyToAddresses:("*") AND NOT mailFromAddresses:("*company.com") AND mailThreatType:("suspected, phishing")

5. Recommended Response Actions
Brief list playbooks steps including what searh Trend query must be used with playbook and how.


`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const modelMessages = convertToModelMessages(messages)

  const messagesWithSystem = [
    {
      role: "system" as const,
      content: THREAT_ANALYSIS_SYSTEM_PROMPT,
    },
    ...modelMessages,
  ]

  const result = streamText({
    model: openrouter(modelId),
    messages: messagesWithSystem,
    abortSignal: req.signal,
    temperature: 0.7,
    maxOutputTokens: 2000,
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ isAborted }) => {
      if (isAborted) {
        console.log("[v0] Chat request aborted")
      }
    },
    consumeSseStream: consumeStream,
  })
}

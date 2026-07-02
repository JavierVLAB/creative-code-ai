// Sincroniza el dataset local del agente y lanza un experimento visible en Studio.
import {
  LOCAL_AGENT_EVAL_DATASET_NAME,
  LOCAL_AGENT_EVAL_SCORER_ID,
  LOCAL_AGENT_EVAL_WORKFLOW_ID,
  createLocalAgentEvalDatasetItems,
  localAgentOutputExpectationsScorer,
} from './local-agent-experiment.js'

async function getOrCreateDataset() {
  const { mastra } = await import('../index.js')
  const datasets = await mastra.datasets.list({ perPage: 100 })
  const existingDataset = datasets.datasets.find(
    (dataset) => dataset.name === LOCAL_AGENT_EVAL_DATASET_NAME,
  )

  if (existingDataset) {
    const dataset = await mastra.datasets.get({ id: existingDataset.id })
    await dataset.update({
      description:
        'Bateria local de 5 casos para revisar trazas, outputs y comportamiento del workflow agent-guardrails.',
      metadata: {
        owner: 'local-agent-observability-evals',
        updatedBy: 'pnpm run eval:local',
      },
      targetType: 'workflow',
      targetIds: [LOCAL_AGENT_EVAL_WORKFLOW_ID],
    })
    return dataset
  }

  return mastra.datasets.create({
    name: LOCAL_AGENT_EVAL_DATASET_NAME,
    description:
      'Bateria local de 5 casos para revisar trazas, outputs y comportamiento del workflow agent-guardrails.',
    metadata: {
      owner: 'local-agent-observability-evals',
      createdBy: 'pnpm run eval:local',
    },
    targetType: 'workflow',
    targetIds: [LOCAL_AGENT_EVAL_WORKFLOW_ID],
  })
}

async function replaceDatasetItems(datasetId: string) {
  const { mastra } = await import('../index.js')
  const dataset = await mastra.datasets.get({ id: datasetId })
  const existingItemsResponse = await dataset.listItems({ perPage: 100 })
  const existingItems = Array.isArray(existingItemsResponse)
    ? existingItemsResponse
    : existingItemsResponse.items

  if (existingItems.length > 0) {
    await dataset.deleteItems({
      itemIds: existingItems.map((item: { id: string }) => item.id),
    })
  }

  await dataset.addItems({
    items: createLocalAgentEvalDatasetItems(),
  })

  return dataset
}

async function run() {
  process.loadEnvFile('.env')

  const dataset = await getOrCreateDataset()
  const syncedDataset = await replaceDatasetItems(dataset.id)

  const summary = await syncedDataset.startExperiment({
    name: `local-agent-observability-${new Date().toISOString()}`,
    description:
      'Experimento local del workflow agent-guardrails para revisar la bateria inicial en Studio.',
    targetType: 'workflow',
    targetId: LOCAL_AGENT_EVAL_WORKFLOW_ID,
    scorers: [localAgentOutputExpectationsScorer],
    maxConcurrency: 1,
    itemTimeout: 120000,
    maxRetries: 0,
  })

  console.log(`Dataset: ${LOCAL_AGENT_EVAL_DATASET_NAME}`)
  console.log(`ExperimentId: ${summary.experimentId}`)
  console.log(`Status: ${summary.status}`)
  console.log(`Scorer: ${LOCAL_AGENT_EVAL_SCORER_ID}`)
  console.log(`Revisa el experimento en Mastra Studio > Datasets > ${LOCAL_AGENT_EVAL_DATASET_NAME}`)
}

void run().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error)
  console.error(message)
  process.exitCode = 1
})

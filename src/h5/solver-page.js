import { loadCommonJsModule } from './commonjs-runtime.js';
import { getQueryPuzzle } from './platform.js';
import {
  renderDigitKeypad,
  renderGuideControls,
  renderSolverBoard,
  renderSolverSteps,
  renderStatusMessage
} from './dom-helpers.js';

const SHARED_SOLVER_CONTROLLER_URL = new URL('../../miniapps/shared/solver-controller.js', import.meta.url).toString();

const elements = {
  board: document.querySelector('#h5-solver-board'),
  keypad: document.querySelector('#h5-solver-keypad'),
  input: document.querySelector('#h5-solver-input'),
  importButton: document.querySelector('#h5-solver-import'),
  solveButton: document.querySelector('#h5-solver-solve'),
  clearButton: document.querySelector('#h5-solver-clear'),
  sampleButton: document.querySelector('#h5-solver-sample'),
  message: document.querySelector('#h5-solver-message'),
  stepCount: document.querySelector('#h5-solver-step-count'),
  progress: document.querySelector('#h5-solver-progress'),
  guideTitle: document.querySelector('#h5-solver-guide-title'),
  guideDescription: document.querySelector('#h5-solver-guide-description'),
  guideControls: document.querySelector('#h5-solver-guide-controls'),
  steps: document.querySelector('#h5-solver-steps')
};

let controller = null;
let currentData = null;

function render(nextData = currentData) {
  if (!nextData) {
    return;
  }

  currentData = nextData;
  elements.board.innerHTML = renderSolverBoard(nextData.cells);
  elements.keypad.innerHTML = renderDigitKeypad([1, 2, 3, 4, 5, 6, 7, 8, 9], {
    subtle: true,
    className: 'keypad solver-keypad',
    extraButtons: [{ action: 'clear-cell', label: '清空', className: '' }]
  });
  elements.message.innerHTML = renderStatusMessage(nextData.message);
  elements.stepCount.textContent = nextData.stepCountText;
  elements.progress.textContent = nextData.guideAvailable
    ? nextData.guideProgressText
    : `${nextData.stepCountText} 条`;
  elements.guideTitle.textContent = nextData.guideStepTitle || '解题步骤';
  elements.guideDescription.textContent =
    nextData.guideStepDescription || '求解后可以从头逐步查看机器的推演过程。';
  elements.guideControls.innerHTML = renderGuideControls(nextData);
  elements.steps.innerHTML = renderSolverSteps(nextData);

  if (elements.input.value !== nextData.inputText) {
    elements.input.value = nextData.inputText;
  }
}

function commit(action) {
  render(action());
}

function bindEvents() {
  elements.board.addEventListener('click', (event) => {
    const cell = event.target.closest('[data-row][data-col]');

    if (!cell) {
      return;
    }

    commit(() => controller.selectCell(Number(cell.dataset.row), Number(cell.dataset.col)));
  });

  elements.keypad.addEventListener('click', (event) => {
    const button = event.target.closest('button');

    if (!button) {
      return;
    }

    if (button.dataset.digit) {
      commit(() => controller.enterDigit(Number(button.dataset.digit)));
      return;
    }

    if (button.dataset.action === 'clear-cell') {
      commit(() => controller.clearCell());
    }
  });

  elements.importButton.addEventListener('click', () => {
    commit(() => controller.importText(elements.input.value));
  });

  elements.solveButton.addEventListener('click', () => {
    commit(() => controller.solve());
  });

  elements.clearButton.addEventListener('click', () => {
    commit(() => controller.clear());
  });

  elements.sampleButton.addEventListener('click', () => {
    commit(() => controller.loadSample());
  });

  elements.guideControls.addEventListener('click', (event) => {
    const button = event.target.closest('button');

    if (!button || button.disabled) {
      return;
    }

    switch (button.id) {
      case 'h5-guide-start':
        commit(() => controller.startGuide());
        break;
      case 'h5-guide-prev':
        commit(() => controller.prevGuideStep());
        break;
      case 'h5-guide-next':
        commit(() => controller.nextGuideStep());
        break;
      case 'h5-guide-solution':
        commit(() => controller.showGuideSolution());
        break;
      default:
        break;
    }
  });

  elements.steps.addEventListener('click', (event) => {
    const item = event.target.closest('[data-step-index]');

    if (!item) {
      return;
    }

    commit(() => controller.jumpToGuideStep(Number(item.dataset.stepIndex)));
  });
}

function renderFatalError(error) {
  const message = error instanceof Error ? error.message : 'H5 解题页初始化失败。';
  elements.message.textContent = message;
}

async function bootstrap() {
  const { createSolverController } = await loadCommonJsModule(SHARED_SOLVER_CONTROLLER_URL);

  controller = createSolverController({
    queryPuzzle: getQueryPuzzle()
  });
  bindEvents();
  render(controller.init());
}

bootstrap().catch(renderFatalError);

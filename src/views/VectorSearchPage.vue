<template>
  <div class="vector-search-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="vector-control-panel">
          <template #header>
            <div class="panel-header">
              <h3>向量检索控制面板</h3>
              <el-tag size="small" type="success">企业版功能</el-tag>
            </div>
          </template>

          <!-- 搜索类型选择 -->
          <div class="search-type-selection">
            <h4>检索类型</h4>
            <el-radio-group v-model="searchType" size="large">
              <el-radio-button label="semantic">语义检索</el-radio-button>
              <el-radio-button label="hybrid">混合检索</el-radio-button>
              <el-radio-button label="advanced">高级检索</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 模型选择 -->
          <div class="model-selection">
            <h4>嵌入模型</h4>
            <el-select v-model="selectedModel" placeholder="选择嵌入模型" style="width: 100%">
              <el-option
                v-for="model in embeddingModels"
                :key="model.value"
                :label="model.label"
                :value="model.value">
                <div class="model-option">
                  <div class="model-icon" :style="{ backgroundColor: model.color }">
                    <el-icon><component :is="model.icon" /></el-icon>
                  </div>
                  <div class="model-info">
                    <div class="model-name">{{ model.label }}</div>
                    <div class="model-desc">{{ model.description }}</div>
                  </div>
                  <el-tag size="small" :type="model.tag.type">{{ model.tag.text }}</el-tag>
                </div>
              </el-option>
            </el-select>
          </div>

          <!-- 向量数据库选择 -->
          <div class="database-selection">
            <h4>向量数据库</h4>
            <el-select v-model="selectedDatabase" placeholder="选择向量数据库" style="width: 100%">
              <el-option
                v-for="db in vectorDatabases"
                :key="db.value"
                :label="db.label"
                :value="db.value">
                <div class="model-option">
                  <div class="model-icon" :style="{ backgroundColor: db.color }">
                    <el-icon><component :is="db.icon" /></el-icon>
                  </div>
                  <div class="model-info">
                    <div class="model-name">{{ db.label }}</div>
                    <div class="model-desc">{{ db.description }}</div>
                  </div>
                </div>
              </el-option>
            </el-select>
          </div>

          <!-- 高级参数设置 -->
          <div class="advanced-parameters">
            <h4>高级参数
              <el-tooltip content="这些参数影响检索结果的质量和性能" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </h4>

            <div class="parameter-item">
              <div class="parameter-label">
                <span>TopK结果数</span>
                <span class="parameter-value">{{ topK }}</span>
              </div>
              <el-slider v-model="topK" :min="1" :max="50" :step="1" :marks="{1: '1', 10: '10', 20: '20', 50: '50'}" />
            </div>

            <div class="parameter-item">
              <div class="parameter-label">
                <span>相似度阈值</span>
                <span class="parameter-value">{{ similarityThreshold.toFixed(2) }}</span>
              </div>
              <el-slider v-model="similarityThreshold" :min="0" :max="1" :step="0.01" :marks="{0: '0', 0.5: '0.5', 1: '1'}" />
            </div>

            <div class="parameter-item">
              <div class="parameter-label">
                <span>向量维度</span>
                <el-select v-model="vectorDimension" size="small" class="dimension-select">
                  <el-option label="128维" value="128" />
                  <el-option label="384维" value="384" />
                  <el-option label="768维" value="768" />
                  <el-option label="1024维" value="1024" />
                  <el-option label="1536维" value="1536" />
                </el-select>
              </div>
            </div>

            <div class="parameter-item">
              <div class="parameter-label">
                <span>索引类型</span>
                <el-select v-model="indexType" size="small" class="dimension-select">
                  <el-option label="HNSW" value="hnsw" />
                  <el-option label="Flat" value="flat" />
                  <el-option label="IVF" value="ivf" />
                  <el-option label="Annoy" value="annoy" />
                </el-select>
              </div>
            </div>
          </div>

          <!-- 数据源设置 -->
          <div class="data-source">
            <h4>数据源</h4>
            <el-checkbox-group v-model="selectedDataSources">
              <el-checkbox label="documents">文档库</el-checkbox>
              <el-checkbox label="knowledge">知识库</el-checkbox>
              <el-checkbox label="qa">问答对</el-checkbox>
              <el-checkbox label="external">外部API</el-checkbox>
            </el-checkbox-group>
          </div>

          <div class="action-buttons">
            <el-button type="primary" :loading="searching" @click="performSearch">
              <el-icon><Search /></el-icon> 执行检索
            </el-button>
            <el-button @click="resetParameters">
              <el-icon><RefreshLeft /></el-icon> 重置参数
            </el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card class="main-search-panel">
          <div class="search-input-container">
            <div class="search-header">
              <h2>向量语义检索</h2>
              <div class="search-stats">
                <div class="stat-item">
                  <div class="stat-value">{{ formatNumber(totalVectors) }}</div>
                  <div class="stat-label">总向量数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ formatNumber(searchHistory.length) }}</div>
                  <div class="stat-label">检索历史</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ averageResponseTime }}ms</div>
                  <div class="stat-label">平均响应时间</div>
                </div>
              </div>
            </div>

            <div class="query-input">
              <el-input
                v-model="searchQuery"
                type="textarea"
                :rows="3"
                placeholder="输入检索查询内容..."
                @keydown.enter.native.prevent="performSearch"
              >
                <template #prefix>
                  <el-icon v-if="searchType === 'semantic'"><ChatDotRound /></el-icon>
                  <el-icon v-else-if="searchType === 'hybrid'"><Connection /></el-icon>
                  <el-icon v-else><Setting /></el-icon>
                </template>
              </el-input>

              <div class="search-helpers">
                <el-upload
                  class="upload-demo"
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleFileChange"
                >
                  <el-button type="info" plain>
                    <el-icon><Upload /></el-icon> 上传文件
                  </el-button>
                </el-upload>

                <el-button v-if="selectedExample === ''" type="info" plain @click="toggleExampleQueries">
                  <el-icon><Document /></el-icon> 示例查询
                </el-button>
                <el-select
                  v-else
                  v-model="selectedExample"
                  placeholder="选择示例查询"
                  @change="useExampleQuery"
                  style="width: 160px;"
                >
                  <el-option
                    v-for="example in exampleQueries"
                    :key="example.id"
                    :label="example.title"
                    :value="example.id"
                  />
                </el-select>

                <el-button type="info" plain @click="toggleVoiceSearch">
                  <el-icon><Microphone /></el-icon> 语音输入
                </el-button>
              </div>
            </div>
          </div>

          <!-- 结果可视化 -->
          <div class="visualization-container" v-if="searchResults.length > 0">
            <div class="visualization-header">
              <h3>向量空间可视化</h3>
              <div class="visual-controls">
                <el-radio-group v-model="visualizationType" size="small">
                  <el-radio-button label="scatter">散点图</el-radio-button>
                  <el-radio-button label="tsne">t-SNE</el-radio-button>
                  <el-radio-button label="umap">UMAP</el-radio-button>
                </el-radio-group>

                <el-select v-model="visualizationDimension" size="small" style="width: 120px;">
                  <el-option label="2D" value="2d" />
                  <el-option label="3D" value="3d" />
                </el-select>
              </div>
            </div>

            <div class="visualization-chart" ref="visualizationChart">
              <div class="chart-placeholder">
                <div class="vector-plot">
                  <div v-for="(point, idx) in plotPoints" :key="idx"
                       class="vector-point"
                       :style="{
                         left: `${point.x}%`,
                         top: `${point.y}%`,
                         backgroundColor: point.color,
                         transform: `scale(${point.similarity})`,
                       }"
                       :class="{ 'query-point': point.isQuery }"
                       @mouseenter="highlightResult(idx)"
                       @mouseleave="unhighlightResult()"
                  ></div>
                  <div class="vector-query-point"
                       :style="{
                         left: '50%',
                         top: '50%',
                       }">Q</div>

                  <!-- 相似度线 -->
                  <svg class="similarity-lines" width="100%" height="100%">
                    <line v-for="(point, idx) in plotPoints" :key="`line-${idx}`"
                          :x1="50" :y1="50"
                          :x2="point.x" :y2="point.y"
                          :style="{
                            stroke: point.color,
                            strokeWidth: point.similarity * 2,
                            opacity: point.similarity / 2
                          }"
                          stroke-dasharray="3,3" />
                  </svg>
                </div>
              </div>

              <div class="dimension-reduction-info" v-if="visualizationType !== 'scatter'">
                <el-alert
                  title="降维方法说明"
                  type="info"
                  description="当前使用的降维算法将高维向量映射到低维空间，以便可视化。点的接近度表示向量在语义空间中的相似性。"
                  :closable="false"
                  show-icon
                />
              </div>
            </div>
          </div>

          <!-- 检索结果 -->
          <div class="search-results" v-if="searchResults.length > 0">
            <div class="results-header">
              <h3>检索结果 ({{ searchResults.length }})</h3>
              <div class="results-actions">
                <el-select v-model="resultsSortBy" size="small" style="width: 120px;">
                  <el-option label="相似度排序" value="similarity" />
                  <el-option label="时间排序" value="date" />
                  <el-option label="来源排序" value="source" />
                </el-select>

                <el-switch
                  v-model="showVectorDetails"
                  active-text="显示向量详情"
                  inactive-text=""
                  size="small"
                />
              </div>
            </div>

            <div class="result-metrics">
              <div class="metric">
                <div class="metric-label">检索时间</div>
                <div class="metric-value">{{ searchTime }}ms</div>
              </div>
              <div class="metric">
                <div class="metric-label">平均相似度</div>
                <div class="metric-value">{{ averageSimilarity.toFixed(4) }}</div>
              </div>
              <div class="metric">
                <div class="metric-label">检索策略</div>
                <div class="metric-value">{{ searchStrategy }}</div>
              </div>
            </div>

            <el-table
              :data="searchResults"
              style="width: 100%"
              :row-class-name="highlightedRow"
              @row-click="handleResultClick"
            >
              <el-table-column type="expand" v-if="showVectorDetails">
                <template #default="props">
                  <div class="vector-details">
                    <div class="vector-info">
                      <h4>向量信息</h4>
                      <div class="vector-attributes">
                        <div class="attribute">
                          <div class="attribute-name">ID:</div>
                          <div class="attribute-value">{{ props.row.id }}</div>
                        </div>
                        <div class="attribute">
                          <div class="attribute-name">维度:</div>
                          <div class="attribute-value">{{ props.row.dimension }}</div>
                        </div>
                        <div class="attribute">
                          <div class="attribute-name">创建时间:</div>
                          <div class="attribute-value">{{ formatDate(props.row.createdAt) }}</div>
                        </div>
                        <div class="attribute">
                          <div class="attribute-name">更新时间:</div>
                          <div class="attribute-value">{{ formatDate(props.row.updatedAt) }}</div>
                        </div>
                      </div>
                    </div>
                    <div class="vector-visualization">
                      <h4>向量可视化</h4>
                      <div class="vector-bar-chart">
                        <div
                          v-for="(value, idx) in props.row.vectorPreview"
                          :key="idx"
                          class="vector-bar"
                          :style="{ height: `${Math.abs(value) * 100}%`, background: value > 0 ? '#4e6ef2' : '#f56c6c' }"
                        ></div>
                      </div>
                      <div class="vector-description">显示向量的前20个维度</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="similarity"
                label="相似度"
                width="120"
                sortable
              >
                <template #default="scope">
                  <div class="similarity-score">
                    <el-progress
                      :percentage="Math.round(scope.row.similarity * 100)"
                      :color="getSimilarityColor(scope.row.similarity)"
                      :show-text="true"
                      :stroke-width="12"
                    />
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="title"
                label="标题"
                min-width="240"
              >
                <template #default="scope">
                  <div class="result-title">{{ scope.row.title }}</div>
                  <div class="result-snippet" v-html="highlightSnippet(scope.row.snippet)"></div>
                </template>
              </el-table-column>
              <el-table-column
                prop="source"
                label="来源"
                width="120"
              >
                <template #default="scope">
                  <el-tag :type="getSourceTagType(scope.row.source)">{{ scope.row.source }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="type"
                label="类型"
                width="100"
              >
                <template #default="scope">
                  <div class="document-type">
                    <el-icon :title="scope.row.type">
                      <component :is="getTypeIcon(scope.row.type)" />
                    </el-icon>
                    <span>{{ scope.row.type }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                width="100"
                label="操作"
              >
                <template #default="scope">
                  <el-button
                    @click.stop="viewDocument(scope.row)"
                    type="primary"
                    size="small"
                    circle
                    title="查看文档"
                  >
                    <el-icon><View /></el-icon>
                  </el-button>
                  <el-button
                    @click.stop="exportVector(scope.row)"
                    type="info"
                    size="small"
                    circle
                    title="导出向量"
                  >
                    <el-icon><Download /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[5, 10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalResults"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 文档预览对话框 -->
    <el-dialog
      v-model="documentPreviewVisible"
      title="文档预览"
      width="70%"
      top="5vh"
      :destroy-on-close="true"
    >
      <div class="document-preview" v-if="selectedDocument">
        <div class="document-info">
          <h2>{{ selectedDocument.title }}</h2>
          <div class="document-metadata">
            <el-tag>{{ selectedDocument.source }}</el-tag>
            <el-tag type="info">{{ selectedDocument.type }}</el-tag>
            <span class="document-date">创建时间: {{ formatDate(selectedDocument.createdAt) }}</span>
          </div>
        </div>

        <el-divider />

        <div class="document-content" v-html="selectedDocument.content"></div>

        <el-tabs v-model="documentTab" class="document-tabs">
          <el-tab-pane label="相似文档" name="similar">
            <div class="similar-documents">
              <el-empty v-if="similarDocuments.length === 0" description="暂无相似文档" />
              <div v-else class="similar-document-list">
                <div v-for="doc in similarDocuments" :key="doc.id" class="similar-document-item">
                  <div class="similar-document-title">{{ doc.title }}</div>
                  <div class="similar-document-similarity">
                    相似度: {{ (doc.similarity * 100).toFixed(2) }}%
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="向量详情" name="vector">
            <div class="vector-details-full">
              <div class="vector-chart">
                <h4>向量可视化</h4>
                <div class="vector-bar-chart-full">
                  <div
                    v-for="(value, idx) in selectedDocument.vectorPreview"
                    :key="idx"
                    class="vector-bar"
                    :style="{ height: `${Math.abs(value) * 100}%`, background: value > 0 ? '#4e6ef2' : '#f56c6c' }"
                  ></div>
                </div>
              </div>

              <div class="vector-statistics">
                <h4>向量统计</h4>
                <div class="vector-stat-item">
                  <span>均值:</span>
                  <span>{{ calculateMean(selectedDocument.vectorPreview).toFixed(4) }}</span>
                </div>
                <div class="vector-stat-item">
                  <span>最大值:</span>
                  <span>{{ Math.max(...selectedDocument.vectorPreview).toFixed(4) }}</span>
                </div>
                <div class="vector-stat-item">
                  <span>最小值:</span>
                  <span>{{ Math.min(...selectedDocument.vectorPreview).toFixed(4) }}</span>
                </div>
                <div class="vector-stat-item">
                  <span>标准差:</span>
                  <span>{{ calculateStdDev(selectedDocument.vectorPreview).toFixed(4) }}</span>
                </div>
              </div>
            </div>

            <el-divider />

            <div class="vector-raw-data">
              <h4>原始向量数据 <small>(前50个维度)</small></h4>
              <el-input
                type="textarea"
                :rows="8"
                :value="formatVectorData(selectedDocument.vectorPreview)"
                readonly
              />
            </div>
          </el-tab-pane>
          <el-tab-pane label="元数据" name="metadata">
            <div class="document-metadata-full">
              <el-descriptions :column="3" border>
                <el-descriptions-item label="ID">{{ selectedDocument.id }}</el-descriptions-item>
                <el-descriptions-item label="类型">{{ selectedDocument.type }}</el-descriptions-item>
                <el-descriptions-item label="来源">{{ selectedDocument.source }}</el-descriptions-item>
                <el-descriptions-item label="创建时间" :span="2">{{ formatDate(selectedDocument.createdAt) }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ formatDate(selectedDocument.updatedAt) }}</el-descriptions-item>
                <el-descriptions-item label="向量维度">{{ selectedDocument.dimension }}</el-descriptions-item>
                <el-descriptions-item label="文档大小">{{ formatFileSize(selectedDocument.size) }}</el-descriptions-item>
                <el-descriptions-item label="所属集合">{{ selectedDocument.collection }}</el-descriptions-item>
              </el-descriptions>

              <h4 class="metadata-title">自定义元数据</h4>
              <el-table :data="documentMetadataList" border style="width: 100%">
                <el-table-column prop="key" label="键" width="180" />
                <el-table-column prop="value" label="值" />
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="documentPreviewVisible = false">关闭</el-button>
          <el-button type="primary" @click="exportDocument">
            导出文档
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 语音输入对话框 -->
    <el-dialog
      v-model="voiceInputVisible"
      title="语音输入"
      width="400px"
    >
      <div class="voice-input-container">
        <div class="voice-wave" :class="{ 'recording': isRecording }">
          <div v-for="n in 5" :key="n" class="wave-bar"></div>
        </div>
        <div class="voice-status">{{ isRecording ? '正在录音...' : '点击按钮开始录音' }}</div>
        <div class="voice-time" v-if="isRecording">{{ recordingTime }}s</div>
        <el-button
          :type="isRecording ? 'danger' : 'primary'"
          class="voice-button"
          @click="toggleRecording"
        >
          <el-icon>
            <Microphone />
          </el-icon>
          {{ isRecording ? '停止' : '开始录音' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  Search,
  InfoFilled,
  ChatDotRound,
  Connection,
  Setting,
  Document,
  Upload,
  Microphone,
  Download,
  View,
  RefreshLeft
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 搜索控制参数
const searchType = ref('semantic');
const searchQuery = ref('');
const selectedModel = ref('openai-text-embedding-3-small');
const selectedDatabase = ref('pinecone');
const topK = ref(10);
const similarityThreshold = ref(0.7);
const vectorDimension = ref('1536');
const indexType = ref('hnsw');
const selectedDataSources = ref(['documents', 'knowledge']);
const searching = ref(false);

// 可视化参数
const visualizationType = ref('scatter');
const visualizationDimension = ref('2d');
const visualizationChart = ref(null);

// 结果展示参数
const searchResults = ref<any[]>([]);
const resultsSortBy = ref('similarity');
const showVectorDetails = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalResults = ref(0);
const searchTime = ref(0);
const averageSimilarity = ref(0);
const searchStrategy = ref('语义相似度');
const highlightedResultIndex = ref(-1);

// 文档预览参数
const documentPreviewVisible = ref(false);
const selectedDocument = ref(null);
const documentTab = ref('similar');
const similarDocuments = ref([]);

// 语音输入参数
const voiceInputVisible = ref(false);
const isRecording = ref(false);
const recordingTime = ref(0);
let recordingTimer: number | null = null;

// 示例查询
const selectedExample = ref('');
const exampleQueries = [
  { id: '1', title: '招生政策', query: '请介绍贵校今年的招生政策和计划' },
  { id: '2', title: '计算机专业', query: '计算机科学与技术专业的核心课程有哪些？' },
  { id: '3', title: '奖学金申请', query: '学校有哪些奖学金，如何申请？' },
  { id: '4', title: '国际交流', query: '学校与哪些国外大学有交换生项目？' },
  { id: '5', title: '住宿条件', query: '学校宿舍的住宿条件如何？' }
];

// 嵌入模型数据
const embeddingModels = [
  {
    value: 'openai-text-embedding-3-small',
    label: 'OpenAI Embedding 3 Small',
    description: '较小尺寸，维度768，高效快速',
    icon: 'Document',
    color: '#10b981',
    tag: { type: 'success', text: '推荐' }
  },
  {
    value: 'openai-text-embedding-3-large',
    label: 'OpenAI Embedding 3 Large',
    description: '大型模型，维度3072，更高质量',
    icon: 'Document',
    color: '#3b82f6',
    tag: { type: 'primary', text: '高精度' }
  },
  {
    value: 'bge-large-zh-v1.5',
    label: 'BGE Large Chinese',
    description: '针对中文优化的大型嵌入模型',
    icon: 'Document',
    color: '#6366f1',
    tag: { type: 'info', text: '中文优化' }
  },
  {
    value: 'moka-ai/m3e-base',
    label: 'M3E Base',
    description: '轻量级中英双语嵌入模型',
    icon: 'Document',
    color: '#ec4899',
    tag: { type: 'warning', text: '轻量级' }
  },
  {
    value: 'custom-model',
    label: '自定义模型',
    description: '使用自定义或本地嵌入模型',
    icon: 'Setting',
    color: '#64748b',
    tag: { type: 'info', text: '自定义' }
  }
];

// 向量数据库选项
const vectorDatabases = [
  {
    value: 'pinecone',
    label: 'Pinecone',
    description: '高性能向量数据库，支持百万级向量',
    icon: 'Connection',
    color: '#10b981'
  },
  {
    value: 'milvus',
    label: 'Milvus',
    description: '开源向量数据库，自部署灵活',
    icon: 'Connection',
    color: '#3b82f6'
  },
  {
    value: 'weaviate',
    label: 'Weaviate',
    description: '语义搜索引擎，支持多模态数据',
    icon: 'Connection',
    color: '#6366f1'
  },
  {
    value: 'qdrant',
    label: 'Qdrant',
    description: '向量相似度引擎，适合小规模集群',
    icon: 'Connection',
    color: '#ec4899'
  },
  {
    value: 'local',
    label: '本地索引',
    description: '使用本地FAISS或Annoy索引',
    icon: 'Connection',
    color: '#64748b'
  }
];

// 统计数据
const totalVectors = ref(1287654);
const searchHistory = ref([]);
const averageResponseTime = ref(156);

// 生成随机点位置用于可视化
const plotPoints = computed(() => {
  if (searchResults.value.length === 0) return [];

  return searchResults.value.slice(0, 10).map((result, idx) => {
    // 生成随机位置，但让相似度高的点更靠近中心
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 * (1 - result.similarity * 0.8); // 相似度高的更靠近中心
    const x = 50 + Math.cos(angle) * distance;
    const y = 50 + Math.sin(angle) * distance;

    return {
      x,
      y,
      color: getSimilarityColor(result.similarity),
      similarity: result.similarity,
      isQuery: false,
      index: idx
    };
  });
});

// 格式化数字
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (size < 1024) {
    return size + ' B';
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB';
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + ' MB';
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
};

// 获取相似度颜色
const getSimilarityColor = (similarity: number) => {
  if (similarity > 0.85) return '#10b981'; // 绿色
  if (similarity > 0.7) return '#3b82f6'; // 蓝色
  if (similarity > 0.5) return '#f59e0b'; // 黄色
  return '#ef4444'; // 红色
};

// 获取来源标签类型
const getSourceTagType = (source: string) => {
  switch(source) {
    case '知识库': return 'success';
    case '文档库': return 'primary';
    case '问答库': return 'warning';
    case '外部API': return 'info';
    default: return '';
  }
};

// 获取文档类型图标
const getTypeIcon = (type: string) => {
  switch(type) {
    case 'PDF': return Document;
    case '文档': return Document;
    case '图片': return View;
    case '问答': return ChatDotRound;
    default: return Document;
  }
};

// 高亮搜索词
const highlightSnippet = (snippet: string) => {
  if (!searchQuery.value) return snippet;

  const keywords = searchQuery.value.split(' ').filter(w => w.length > 1);
  let highlightedSnippet = snippet;

  keywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    highlightedSnippet = highlightedSnippet.replace(regex, match => `<span class="highlight">${match}</span>`);
  });

  return highlightedSnippet;
};

// 高亮选中行
const highlightedRow = ({ row, rowIndex }: { row: any, rowIndex: number }) => {
  if (rowIndex === highlightedResultIndex.value) {
    return 'highlighted-row';
  }
  return '';
};

// 处理文件上传
const handleFileChange = (file: any) => {
  ElMessage.success(`已选择文件: ${file.name}`);
  // 模拟从文件中提取查询
  searchQuery.value = `分析文件 ${file.name} 中的主要内容和观点`;
};

// 切换语音搜索
const toggleVoiceSearch = () => {
  voiceInputVisible.value = true;
};

// 切换录音状态
const toggleRecording = () => {
  isRecording.value = !isRecording.value;

  if (isRecording.value) {
    // 开始录音，设置计时器
    recordingTime.value = 0;
    recordingTimer = window.setInterval(() => {
      recordingTime.value++;
      // 模拟20秒后自动停止
      if (recordingTime.value >= 20) {
        toggleRecording();
      }
    }, 1000);
  } else {
    // 停止录音，清除计时器
    if (recordingTimer) {
      window.clearInterval(recordingTimer);
      recordingTimer = null;
    }

    // 模拟语音识别结果
    if (recordingTime.value > 1) {
      setTimeout(() => {
        searchQuery.value = "学校的招生计划和各专业的录取分数线是多少？";
        voiceInputVisible.value = false;
        ElMessage.success('语音识别成功');
      }, 1000);
    } else {
      ElMessage.warning('录音时间太短');
    }
  }
};

// 切换示例查询显示
const toggleExampleQueries = () => {
  selectedExample.value = '1';
};

// 使用示例查询
const useExampleQuery = () => {
  const example = exampleQueries.find(q => q.id === selectedExample.value);
  if (example) {
    searchQuery.value = example.query;
  }
};

// 计算向量均值
const calculateMean = (vector: number[]) => {
  return vector.reduce((acc, val) => acc + val, 0) / vector.length;
};

// 计算向量标准差
const calculateStdDev = (vector: number[]) => {
  const mean = calculateMean(vector);
  const squareDiffs = vector.map(value => {
    const diff = value - mean;
    return diff * diff;
  });
  const avgSquareDiff = calculateMean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
};

// 格式化向量数据
const formatVectorData = (vector: number[]) => {
  return JSON.stringify(vector, null, 2);
};

// 执行向量检索
const performSearch = () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入检索内容');
    return;
  }

  searching.value = true;

  // 模拟检索延迟
  setTimeout(() => {
    // 生成模拟检索结果
    const resultCount = Math.floor(Math.random() * 30) + 5;
    totalResults.value = resultCount;

    searchTime.value = Math.floor(Math.random() * 200) + 50;
    averageSimilarity.value = 0;

    // 生成随机结果
    const results = [];
    for (let i = 0; i < resultCount; i++) {
      const similarity = Math.random() * 0.3 + 0.7 - (i * 0.01);
      averageSimilarity.value += similarity;

      // 随机文档类型
      const documentTypes = ['PDF', '文档', '图片', '问答'];
      const documentType = documentTypes[Math.floor(Math.random() * documentTypes.length)];

      // 随机来源
      const sources = ['知识库', '文档库', '问答库', '外部API'];
      const source = sources[Math.floor(Math.random() * sources.length)];

      // 随机生成日期
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 100));

      // 随机生成向量预览
      const vectorPreview = Array(20).fill(0).map(() => (Math.random() * 2 - 1) * 0.5);

      // 构建结果对象
      results.push({
        id: `doc-${Math.floor(Math.random() * 10000)}`,
        similarity,
        title: `${source}文档示例-${i+1}`,
        snippet: `这是一个${source}中的样本文档，与查询"${searchQuery.value}"具有相似性。这个文档包含了关于${searchQuery.value.split(' ')[0]}的重要信息。`,
        source,
        type: documentType,
        dimension: vectorDimension.value,
        createdAt: date.toISOString(),
        updatedAt: new Date().toISOString(),
        vectorPreview,
        content: `<h3>文档内容</h3><p>这是一个示例文档的详细内容。</p><p>该文档与您的查询"${searchQuery.value}"有较高的相似度(${(similarity * 100).toFixed(2)}%)。</p><p>这里可以是包含丰富格式的HTML内容，例如:</p><ul><li>项目1: 重要信息</li><li>项目2: 相关数据</li><li>项目3: 补充内容</li></ul><p>查询词"${searchQuery.value.split(' ')[0]}"在本文档中多次出现并有详细解释。</p>`,
        size: Math.floor(Math.random() * 1024 * 1024 * 5),
        collection: `${source}集合`
      });
    }

    searchResults.value = results;
    averageSimilarity.value /= resultCount;

    // 随机搜索策略
    const strategies = ['语义相似度', '混合匹配', '关键词+向量', 'BM25+语义'];
    searchStrategy.value = strategies[Math.floor(Math.random() * strategies.length)];

    searchHistory.value.push({
      query: searchQuery.value,
      timestamp: new Date().toISOString(),
      resultCount
    });

    searching.value = false;
  }, 1500);
};

// 重置参数
const resetParameters = () => {
  searchType.value = 'semantic';
  selectedModel.value = 'openai-text-embedding-3-small';
  selectedDatabase.value = 'pinecone';
  topK.value = 10;
  similarityThreshold.value = 0.7;
  vectorDimension.value = '1536';
  indexType.value = 'hnsw';
  selectedDataSources.value = ['documents', 'knowledge'];

  ElMessage.success('参数已重置为默认值');
};

// 高亮结果
const highlightResult = (index: number) => {
  highlightedResultIndex.value = index;
};

// 取消高亮
const unhighlightResult = () => {
  highlightedResultIndex.value = -1;
};

// 查看文档详情
const viewDocument = (document: any) => {
  selectedDocument.value = document;
  documentPreviewVisible.value = true;
  documentTab.value = 'similar';

  // 模拟加载相似文档
  similarDocuments.value = [];
  setTimeout(() => {
    // 生成3-5个相似文档
    const count = Math.floor(Math.random() * 3) + 3;
    const similar = [];

    for (let i = 0; i < count; i++) {
      const similarity = document.similarity * (0.8 - i * 0.1) + Math.random() * 0.1;
      similar.push({
        id: `similar-${Math.floor(Math.random() * 10000)}`,
        title: `相似文档 ${i+1} - ${document.title.split('-')[0]}系列`,
        similarity: similarity > 1 ? 0.99 : similarity,
        source: document.source
      });
    }

    similarDocuments.value = similar;
  }, 800);
};

// 导出向量
const exportVector = (document: any) => {
  ElMessage.success(`已导出文档"${document.title}"的向量数据`);
};

// 导出文档
const exportDocument = () => {
  if (!selectedDocument.value) return;

  ElMessage.success(`已导出文档"${selectedDocument.value.title}"`);
};

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size;
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
};

// 文档元数据
const documentMetadataList = computed(() => {
  if (!selectedDocument.value) return [];

  return [
    { key: 'author', value: '张教授' },
    { key: 'department', value: '招生办公室' },
    { key: 'keywords', value: '招生,计划,分数线,专业' },
    { key: 'status', value: '已审核' },
    { key: 'language', value: '中文' }
  ];
});

// 组件挂载
onMounted(() => {
  // 模拟初始化
  totalVectors.value = 1287654;
  averageResponseTime.value = Math.floor(Math.random() * 100) + 100;
});
</script>

<style scoped>
.vector-search-container {
  padding: 20px;
  background-color: #f9fafc;
  min-height: 100vh;
}

/* 控制面板样式 */
.vector-control-panel {
  border-radius: 8px;
  overflow: hidden;
  position: sticky;
  top: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.search-type-selection,
.model-selection,
.database-selection,
.advanced-parameters,
.data-source {
  margin-bottom: 20px;
}

.search-type-selection h4,
.model-selection h4,
.database-selection h4,
.advanced-parameters h4,
.data-source h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
}

.advanced-parameters h4 .el-icon {
  margin-left: 5px;
  font-size: 14px;
  color: #909399;
  cursor: help;
}

.parameter-item {
  margin-bottom: 15px;
}

.parameter-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 13px;
  color: #606266;
}

.parameter-value {
  font-weight: 600;
  color: #409EFF;
}

.dimension-select {
  width: 120px;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.model-option {
  display: flex;
  align-items: center;
  padding: 5px 0;
}

.model-icon {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  color: white;
}

.model-info {
  flex: 1;
}

.model-name {
  font-weight: 500;
  font-size: 14px;
}

.model-desc {
  font-size: 12px;
  color: #909399;
}

/* 主搜索面板 */
.main-search-panel {
  border-radius: 8px;
  overflow: hidden;
}

.search-input-container {
  margin-bottom: 20px;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.search-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #409EFF;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.query-input {
  margin-bottom: 15px;
}

.search-helpers {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
}

/* 可视化区域 */
.visualization-container {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.visualization-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.visualization-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.visual-controls {
  display: flex;
  gap: 10px;
}

.visualization-chart {
  height: 300px;
  position: relative;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
}

.chart-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.vector-plot {
  width: 100%;
  height: 100%;
  position: relative;
}

.vector-point {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #409EFF;
  transform-origin: center;
  transition: all 0.3s ease;
  z-index: 2;
  cursor: pointer;
}

.vector-point:hover {
  transform: scale(1.5) !important;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.vector-query-point {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #f56c6c;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  transform: translate(-50%, -50%);
  z-index: 3;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.similarity-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.dimension-reduction-info {
  margin-top: 15px;
}

/* 搜索结果 */
.search-results {
  margin-top: 20px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.results-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.results-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.result-metrics {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  background-color: #f9fafb;
  padding: 15px;
  border-radius: 8px;
}

.metric {
  text-align: center;
  flex: 1;
}

.metric-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
  color: #409EFF;
}

.similarity-score {
  width: 100%;
}

.result-title {
  font-weight: 600;
  margin-bottom: 5px;
}

.result-snippet {
  font-size: 13px;
  color: #606266;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.highlight {
  background-color: rgba(255, 230, 0, 0.3);
  font-weight: 500;
}

.document-type {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 向量详情 */
.vector-details {
  display: flex;
  gap: 20px;
  padding: 10px;
}

.vector-info {
  flex: 1;
}

.vector-info h4, .vector-visualization h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
}

.vector-attributes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.attribute {
  display: flex;
  gap: 5px;
}

.attribute-name {
  font-weight: 600;
  color: #606266;
}

.attribute-value {
  color: #333;
}

.vector-visualization {
  flex: 1;
}

.vector-bar-chart {
  display: flex;
  align-items: flex-end;
  height: 100px;
  gap: 1px;
  background-color: #f9fafb;
  border-radius: 4px;
  padding: 5px;
}

.vector-bar {
  width: 3px;
  height: 20%;
  background-color: #409EFF;
}

.vector-description {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  text-align: center;
}

/* 文档预览 */
.document-info {
  margin-bottom: 20px;
}

.document-info h2 {
  margin-top: 0;
  margin-bottom: 10px;
}

.document-metadata {
  display: flex;
  gap: 10px;
  align-items: center;
}

.document-date {
  font-size: 13px;
  color: #909399;
}

.document-content {
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
  padding: 15px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.document-tabs {
  margin-top: 20px;
}

.similar-documents {
  min-height: 150px;
}

.similar-document-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.similar-document-item {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #ebeef5;
}

.similar-document-title {
  font-weight: 600;
  margin-bottom: 10px;
  font-size: 14px;
}

.similar-document-similarity {
  font-size: 13px;
  color: #409EFF;
}

.vector-details-full {
  display: flex;
  gap: 20px;
}

.vector-chart, .vector-statistics {
  flex: 1;
}

.vector-bar-chart-full {
  display: flex;
  align-items: flex-end;
  height: 150px;
  gap: 1px;
  background-color: #f9fafb;
  border-radius: 4px;
  padding: 5px;
}

.vector-stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.vector-raw-data h4 {
  margin-bottom: 10px;
}

.vector-raw-data small {
  font-weight: normal;
  color: #909399;
  font-size: 12px;
}

.document-metadata-full {
  margin-top: 10px;
}

.metadata-title {
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 16px;
}

/* 语音输入 */
.voice-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.voice-wave {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  width: 200px;
  margin-bottom: 20px;
}

.wave-bar {
  width: 4px;
  height: 20px;
  background-color: #409EFF;
  margin: 0 3px;
  border-radius: 2px;
  transition: height 0.2s ease;
}

.recording .wave-bar {
  animation: wave 1s infinite ease-in-out;
}

.recording .wave-bar:nth-child(1) {
  animation-delay: 0s;
}

.recording .wave-bar:nth-child(2) {
  animation-delay: 0.2s;
}

.recording .wave-bar:nth-child(3) {
  animation-delay: 0.4s;
}

.recording .wave-bar:nth-child(4) {
  animation-delay: 0.6s;
}

.recording .wave-bar:nth-child(5) {
  animation-delay: 0.8s;
}

@keyframes wave {
  0%, 100% {
    height: 20px;
  }
  50% {
    height: 60px;
  }
}

.voice-status {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
}

.voice-time {
  font-size: 24px;
  font-weight: 500;
  color: #409EFF;
  margin-bottom: 20px;
}

.voice-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160px;
}

/* 高亮行样式 */
:deep(.highlighted-row) {
  background-color: rgba(64, 158, 255, 0.1) !important;
}
</style>

/* 
Inspired by Jackson and Mazzei's Thinking with Theory, this project was designed to remain conceptual and abstract, reflecting the fluidity of meaning and the entanglement of theory and data. Rather than treating data as something to be analyzed through a fixed theoretical framework, theory and data are conceptualized as mutually constitutive, shaping and destabilizing each other at dynamic thresholds. Drawing on Deleuze and Guattari's nomadic thought, the project resists static, linear interpretations, instead engaging with theoretical perspectives (e.g., Derrida, Foucault, Butler, Barad) that disrupt and expand one another, producing knowledge relationally rather than through fixed categories, and treating these thresholds as sites of excess and transformation. This approach is reflected in the graph logic, where nodes (theorists) and their connections dynamically generate emerging concepts or perspectives, allowing for thresholds of meaning to emerge dynamically as nodes move and connections form or break. This reflects the theoretical commitment to fluidity and relationality, as the graph structure is constantly in flux. These emergent concepts, tied to specific groupings of nodes, foreground what becomes legible and actionable through each grouping as we consider plugging data into theory. The code prioritizes higher-order groupings, such as trios and quads, ensuring that more complex perspectives overwrite simpler ones when connections overlap. 
*/

const { createApp } = Vue;

const app = createApp({
  data() {
    return {
      nodes: [
        { label: 'Derrida', x: 100, y: 200, color: '#FF5733', dx: 1, dy: 1, concept: 'Meaning is unstable.' },
        { label: 'Foucault', x: 300, y: 100, color: '#33FF57', dx: -1, dy: 1, concept: 'Power is everywhere.' },
        { label: 'Butler', x: 500, y: 300, color: '#3357FF', dx: 1, dy: -1, concept: 'Gender is performative.' },
        { label: 'Deleuze', x: 700, y: 200, color: '#FF33A1', dx: -1, dy: -1, concept: 'Desire forms assemblages.' }
      ],
      lines: [],
      messages: [],
      hoveredNode: null,
      dragOffset: { x: 0, y: 0 },
      conceptMappings: {
        'Derrida ↔ Foucault': 'Meaning and power are co-constructed.',
        'Derrida ↔ Butler': 'Language structures gender norms.',
        'Derrida ↔ Deleuze': 'Desire disrupts structures.',
        'Foucault ↔ Butler': 'Discourse shapes identity performances.',
        'Foucault ↔ Deleuze': 'Power is rhizomatic, not centralized.',
        'Butler ↔ Deleuze': 'Gender flows through assemblages.',
        'Derrida ↔ Foucault ↔ Butler': 'Power, discourse, and performativity destabilize meaning and identity.',
        'Derrida ↔ Foucault ↔ Deleuze': 'Desire and power co-construct meaning in rhizomatic ways.',
        'Derrida ↔ Butler ↔ Deleuze': 'Deconstruction, gender, and desire form assemblages of becoming.',
        'Foucault ↔ Butler ↔ Deleuze': 'Power, performativity, and desire intra-act to produce subjectivities.',
        'Derrida ↔ Foucault ↔ Butler ↔ Deleuze': 'Meaning, power, performativity, and desire rupture and reassemble the conditions of thought.'
      },
      messageIdCounter: 0 
    };
  },
  methods: {
    startDrag(index, event) {
      this.draggingNode = index;
      this.dragOffset = {
        x: event.clientX - this.nodes[index].x,
        y: event.clientY - this.nodes[index].y
      };
      window.addEventListener('mousemove', this.onDrag);
      window.addEventListener('mouseup', this.stopDrag);
    },
    onDrag(event) {
      if (this.draggingNode !== null) {
        this.nodes[this.draggingNode].x = event.clientX - this.dragOffset.x;
        this.nodes[this.draggingNode].y = event.clientY - this.dragOffset.y;
        this.updateLines();
      }
    },
    stopDrag() {
      this.draggingNode = null;
      window.removeEventListener('mousemove', this.onDrag);
      window.removeEventListener('mouseup', this.stopDrag);
    },
    updateLines() {
      const newPairs = new Set();
      const activeNodes = new Set();

      this.lines = [];
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const dx = this.nodes[i].x - this.nodes[j].x;
          const dy = this.nodes[i].y - this.nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200) {
            this.lines.push({
              x1: this.nodes[i].x + 40, y1: this.nodes[i].y + 40,
              x2: this.nodes[j].x + 40, y2: this.nodes[j].y + 40
            });

            const pairKey = `${this.nodes[i].label} ↔ ${this.nodes[j].label}`;
            newPairs.add(pairKey);
            activeNodes.add(this.nodes[i].label);
            activeNodes.add(this.nodes[j].label);

            if (!this.activePairs.has(pairKey)) {
              this.triggerMessage(pairKey, Array.from(activeNodes));
            }
          }
        }
      }

      const connectedGroups = this.findConnectedGroups();
      connectedGroups.forEach((group) => {
        if (group.length === 4) {
          this.triggerMessage('Derrida ↔ Foucault ↔ Butler ↔ Deleuze', group);
        } else if (group.length === 3) {
          const trioKey = group.join(' ↔ ');
          this.triggerMessage(trioKey, group);
        }
      });

      this.activePairs = newPairs;
    },
    findConnectedGroups() {
      const graph = {};
      this.nodes.forEach((node) => (graph[node.label] = []));

      this.lines.forEach((line) => {
        const nodeA = this.nodes.find((n) => n.x + 40 === line.x1 && n.y + 40 === line.y1);
        const nodeB = this.nodes.find((n) => n.x + 40 === line.x2 && n.y + 40 === line.y2);
        if (nodeA && nodeB) {
          graph[nodeA.label].push(nodeB.label);
          graph[nodeB.label].push(nodeA.label);
        }
      });

      const visited = new Set();
      const groups = [];

      const dfs = (node, group) => {
        visited.add(node);
        group.push(node);
        graph[node].forEach((neighbor) => {
          if (!visited.has(neighbor)) dfs(neighbor, group);
        });
      };

      Object.keys(graph).forEach((node) => {
        if (!visited.has(node)) {
          const group = [];
          dfs(node, group);
          groups.push(group);
        }
      });

      return groups;
    },
    triggerMessage(pairKey, activeNodes) {
      const concept = this.conceptMappings[pairKey] || 'Emerging concept';
      const x = activeNodes.reduce((sum, node) => sum + this.nodes.find((n) => n.label === node).x, 0) / activeNodes.length;
      const y = activeNodes.reduce((sum, node) => sum + this.nodes.find((n) => n.label === node).y, 0) / activeNodes.length;

      const groupKey = activeNodes.sort().join(' ↔ '); 

      this.messages = this.messages.filter((msg) => msg.groupKey !== groupKey);

      const newMessage = {
        id: this.messageIdCounter++, 
        text: concept,
        x,
        y,
        groupKey,
        opacity: 1,
        highlight: true 
      };

      this.messages.push(newMessage);
      
     
      setTimeout(() => {
        newMessage.highlight = false;
      }, 1000);

      setTimeout(() => {
        newMessage.opacity = 0;
        setTimeout(() => {
          this.messages = this.messages.filter((msg) => msg !== newMessage);
        }, 500);
      }, 2000);
    },
    moveNodes() {
      for (let node of this.nodes) {
        node.x += node.dx;
        node.y += node.dy;

        if (node.x < 0 || node.x > window.innerWidth - 80) node.dx *= -1;
        if (node.y < 0 || node.y > window.innerHeight - 80) node.dy *= -1;
      }
      this.updateLines();
    }
  },
  mounted() {
    setInterval(this.moveNodes, 50);
  }
});

app.mount("#app");
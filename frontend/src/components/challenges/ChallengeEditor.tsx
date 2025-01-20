import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { submitSolution } from '../../store/slices/challengeSlice';
import { Editor } from '@monaco-editor/react';
import { Button, Select, MenuItem, Paper, Box } from '@mui/material';
import { Challenge } from '../../types';

interface ChallengeEditorProps {
  challenge: Challenge;
}

const ChallengeEditor: React.FC<ChallengeEditorProps> = ({ challenge }) => {
  const dispatch = useDispatch();
  const [code, setCode] = useState(challenge.solutionTemplate);
  const [language, setLanguage] = useState(challenge.supportedLanguages[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await dispatch(submitSolution({
        challengeId: challenge.id,
        code,
        language
      })).unwrap();
    } catch (error) {
      console.error('Fehler beim Einreichen:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          fullWidth
          size="small"
        >
          {challenge.supportedLanguages.map((lang) => (
            <MenuItem key={lang} value={lang}>
              {lang}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Editor
        height="400px"
        language={language.toLowerCase()}
        value={code}
        onChange={(value) => setCode(value || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          automaticLayout: true
        }}
      />

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Wird ausgeführt...' : 'Code ausführen'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ChallengeEditor; 